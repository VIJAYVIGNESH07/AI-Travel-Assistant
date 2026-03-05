import { ChatApiResponse, ChatRequest } from './chatTypes';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.1-8b-instant';

const ALLOWED_TRANSPORT_DOMAINS = [
  'irctc.co.in',
  'redbus.in',
  'goindigo.in',
  'airindia.com',
  'rome2rio.com',
  'skyscanner.com',
  'google.com',
  'uber.com',
  'olacabs.com'
];

const SYSTEM_PROMPT = [
  'You are WanderMate AI, a travel planning assistant built for Indian travelers.',
  'IMPORTANT: ALL prices and budget estimates MUST be in Indian Rupees (INR, ₹). Never use USD or any other currency.',
  'Always set budget.currency to "INR" in your response.',
  'Your job is to create realistic, feasible travel plans that match the user budget and travel style.',
  'Never output a plan that is infeasible for the given budget.',
  'If the budget is too low, set feasible=false, explain why in the summary, and provide 2-3 feasible alternatives.',
  'If feasible, generate 2-3 distinct plan variants with different themes or pacing (e.g. Adventure, Cultural, Relaxed).',
  'Do not default to "low cost" framing unless the budget truly requires it.',
  'Always prefer Indian transport providers: IRCTC trains, Redbus, IndiGo, Air India, Ola, Uber.',
  'Always include transport options using ONLY the approved provider links listed below.',
  'Always include at least 3 attractions per plan with culturally relevant Indian context.',
  'Include hotel suggestions only if the budget supports overnight stay.',
  'For itinerary, provide a day-by-day plan. Each day should have 3-5 specific activities.',
  'Include local Indian food recommendations (e.g. "Breakfast at a local dhaba", "Try pav bhaji at Juhu beach").',
  'Clearly mark all prices as estimates.',
  'Return JSON only. No markdown, no prose outside JSON.',
  'JSON schema:',
  '{',
  '  "feasible": boolean,',
  '  "summary": string,',
  '  "budget": { "currency": "INR", "total_estimate": number, "breakdown": { "transport": number, "lodging": number, "food": number, "local_transport": number } },',
  '  "plans": [',
  '    {',
  '      "label": string,',
  '      "itinerary": [{ "day": number, "plan": string[] }],',
  '      "transport": [{ "type": string, "provider": string, "link": string }],',
  '      "attractions": string[],',
  '      "hotels": [{ "name": string, "area": string, "approx_price": string }]',
  '    }',
  '  ],',
  '  "alternatives": string[],',
  '  "notes": string[]',
  '}',
  'Approved transport providers (use these exact links):',
  '- IRCTC (trains): https://www.irctc.co.in/',
  '- RedBus (buses): https://www.redbus.in/',
  '- IndiGo (flights): https://www.goindigo.in/',
  '- Air India (flights): https://www.airindia.com/',
  '- Rome2Rio: https://www.rome2rio.com/',
  '- Skyscanner: https://www.skyscanner.com/',
  '- Google Flights: https://www.google.com/travel/flights',
  '- Uber: https://www.uber.com/',
  '- Ola: https://www.olacabs.com/'
].join('\n');

const buildUserPrompt = (request: ChatRequest) => {
  const lines: string[] = [];

  if (request.tripRequest) {
    const trip = request.tripRequest;
    lines.push('Trip request details:');
    lines.push(`- Origin: ${trip.origin || 'unknown'}`);
    lines.push(`- Destination: ${trip.destination || 'unspecified'}`);
    lines.push(`- Dates: ${trip.dates || 'unspecified'}`);
    lines.push(`- Budget: ${trip.budget?.amount ?? 'unspecified'} ${trip.budget?.currency || ''}`.trim());
    lines.push(`- Travelers: ${trip.travelers ?? 'unspecified'}`);
    lines.push(`- Style: ${trip.style || 'unspecified'}`);
    lines.push(`- Preferences: ${trip.preferences || 'unspecified'}`);
  }

  lines.push('User message:');
  lines.push(request.message || '');

  return lines.join('\n');
};

const extractJson = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  return null;
};

const isAllowedLink = (link: string) => {
  try {
    const url = new URL(link);
    return ALLOWED_TRANSPORT_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

const sanitizeTransportLinks = (data: Record<string, unknown>) => {
  const plans = Array.isArray((data as { plans?: unknown }).plans)
    ? ((data as { plans?: Array<Record<string, unknown>> }).plans as Array<Record<string, unknown>>)
    : [];

  plans.forEach((plan) => {
    const transport = Array.isArray(plan.transport) ? (plan.transport as Array<Record<string, unknown>>) : [];
    const filtered = transport.filter((item) => {
      const link = typeof item.link === 'string' ? item.link : '';
      return link && isAllowedLink(link);
    });
    plan.transport = filtered;
  });
};

const normalizeResponse = (data: Record<string, unknown>) => {
  if (!data.plans && Array.isArray(data.itinerary)) {
    const plan = {
      label: typeof data.summary === 'string' ? data.summary : 'Plan Option',
      itinerary: data.itinerary,
      transport: data.transport,
      attractions: data.attractions,
      hotels: data.hotels
    };
    data.plans = [plan];
    delete data.itinerary;
    delete data.transport;
    delete data.attractions;
    delete data.hotels;
  }
};

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatApiResponse> => {
  if (!GROQ_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY.');
  }

  const userPrompt = buildUserPrompt(payload);
  const history = Array.isArray(payload.history) ? payload.history.slice(-6) : [];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Groq API request failed (${response.status}). ${responseText}`);
  }

  let rawContent = '';
  try {
    const parsedPayload = JSON.parse(responseText) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    rawContent = parsedPayload?.choices?.[0]?.message?.content?.trim() || '';
  } catch {
    rawContent = responseText;
  }

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = extractJson(rawContent);
  } catch {
    parsed = null;
  }

  if (parsed) {
    normalizeResponse(parsed);
    sanitizeTransportLinks(parsed);
  }

  const reply = parsed && typeof parsed.summary === 'string'
    ? parsed.summary
    : rawContent || 'Here are your travel options.';

  return {
    reply,
    data: parsed ? (parsed as unknown as import('./chatTypes').ChatPlanResponse) : undefined,
    raw: rawContent
  };
};
