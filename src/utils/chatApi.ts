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
  'skyscanner.co.in',
  'google.com',
  'uber.com',
  'olacabs.com'
];

// ── Smart booking deep-link builder ─────────────────────────────────────────
export interface BookingLink {
  provider: string;
  type: string;
  url: string;
  note: string;
}

export const generateBookingLinks = (
  origin: string,
  destination: string,
  isInternational: boolean
): BookingLink[] => {
  const from = encodeURIComponent(origin);
  const to = encodeURIComponent(destination);
  const fromSlug = origin.toLowerCase().replace(/\s+/g, '-');
  const toSlug = destination.toLowerCase().replace(/\s+/g, '-');

  const links: BookingLink[] = [];

  if (isInternational) {
    // Skyscanner — best for international flights
    links.push({
      provider: 'Skyscanner',
      type: 'Flight',
      url: `https://www.skyscanner.co.in/flights/${from}/${to}/`,
      note: 'Compare live flight prices'
    });
    // Google Flights
    links.push({
      provider: 'Google Flights',
      type: 'Flight',
      url: `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}&hl=en`,
      note: 'Search live flights on Google'
    });
    // Air India
    links.push({
      provider: 'Air India',
      type: 'Flight',
      url: `https://www.airindia.com/`,
      note: 'Book Air India flights'
    });
    // IndiGo (domestic legs or indirect)
    links.push({
      provider: 'IndiGo',
      type: 'Flight',
      url: `https://www.goindigo.in/`,
      note: 'Book IndiGo flights'
    });
  } else {
    // Domestic — trains via IRCTC
    links.push({
      provider: 'IRCTC',
      type: 'Train',
      url: `https://www.irctc.co.in/nget/train-search`,
      note: 'Search & book live train tickets'
    });
    // Domestic flights — IndiGo
    links.push({
      provider: 'IndiGo',
      type: 'Flight',
      url: `https://www.goindigo.in/`,
      note: 'Book IndiGo domestic flights'
    });
    // Skyscanner for domestic
    links.push({
      provider: 'Skyscanner',
      type: 'Flight',
      url: `https://www.skyscanner.co.in/flights/${from}/${to}/`,
      note: 'Compare domestic flight prices'
    });
    // Redbus for buses
    links.push({
      provider: 'Redbus',
      type: 'Bus',
      url: `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}/`,
      note: 'Book bus tickets'
    });
  }

  return links;
};

const isInternationalTrip = (origin: string, destination: string): boolean => {
  const indianCities = [
    'mumbai', 'delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata', 'hyderabad',
    'pune', 'ahmedabad', 'jaipur', 'goa', 'kochi', 'amritsar', 'varanasi',
    'agra', 'udaipur', 'mysore', 'mysuru', 'surat', 'lucknow', 'nagpur',
    'bhopal', 'indore', 'patna', 'chandigarh', 'manali', 'shimla', 'darjeeling',
    'leh', 'ladakh', 'rishikesh', 'haridwar', 'coimbatore', 'madurai', 'vizag',
    'visakhapatnam', 'rajkot', 'jodhpur', 'ajmer', 'pushkar', 'hampi',
    'ooty', 'munnar', 'alleppey', 'alappuzha', 'kodaikanal', 'aurangabad'
  ];
  const destLower = destination.toLowerCase();
  // If destination doesn't contain any Indian city, it's international
  return !indianCities.some(city => destLower.includes(city));
};

export { isInternationalTrip };



const SYSTEM_PROMPT = [
  'You are WanderMate AI, a friendly and intelligent travel planning assistant for Indian travelers.',
  '',
  '== HOW TO RESPOND ==',
  'You are a natural conversational AI. Respond naturally to any message.',
  '- Greetings → greet back warmly, ask what travel they have in mind.',
  '- General travel questions → answer in plain conversational text.',
  '- Partial trip info → ask for the ONE most important missing detail.',
  '- Origin + destination both known → generate the JSON plan.',
  '',
  '== EXTRACTING ORIGIN AND DESTINATION FROM A SINGLE MESSAGE ==',
  'When the user writes a message, CAREFULLY extract origin and destination from it.',
  'Common patterns you MUST recognize without asking again:',
  '  "Salem to New York" → origin=Salem, destination=New York',
  '  "I want to travel from Mumbai to Goa" → origin=Mumbai, destination=Goa',
  '  "planning a Delhi to London trip" → origin=Delhi, destination=London',
  '  "Bangalore to Singapore travel plan" → origin=Bangalore, destination=Singapore',
  'If BOTH origin and destination are in the message, do NOT ask for them again — generate the plan.',
  'Only ask for origin if it is truly missing and cannot be inferred from the message.',
  '',
  '== CONVERSATION MEMORY — NEVER FORGET CONTEXT ==',
  'Remember everything said earlier in the conversation.',
  'If origin, destination, or budget was mentioned before, do NOT ask for it again.',
  'Never say "let us start fresh" or "let me start over" — always keep the known context.',
  'If the user gives a correction (e.g. "there is no direct flight"), acknowledge it,',
  '  explain the alternative (via a connecting hub), and continue planning from there.',
  '',
  '== DO NOT INVENT SPECIFIC PRICES ==',
  'You cannot query Skyscanner, IRCTC, or Google Flights in real time.',
  'NEVER state specific ticket prices like "IndiGo: ₹45,000" as if they are live data.',
  'Instead use BROAD ESTIMATES only: e.g. "international flights typically cost ₹60,000-₹1,20,000".',
  'Always tell the user to check the booking platform for actual live prices.',
  'Budget numbers in the JSON plan are rough estimates, not live ticket prices.',
  '',
  '== TRANSPORT ACCURACY ==',
  'Salem, Tamil Nadu has no airport. Route via Chennai (~330km away) or Coimbatore (~160km).',
  'For cities without airports, always route via the nearest major Indian airport.',
  'International trip: ONLY flights for the main journey. Auto/local train is FORBIDDEN.',
  'Domestic long distance (>500km): train (IRCTC) or flight.',
  'Domestic short distance (<200km): bus (Redbus) or train (IRCTC).',
  'Auto/Ola/Uber: local city transport at the destination ONLY — not for main journey.',
  '',
  '== WHEN TO OUTPUT JSON ==',
  'Output JSON ONLY when you have: origin city AND destination city.',
  'Budget and dates are optional; estimate if missing and note it.',
  'NEVER output JSON for greetings, corrections, or casual questions.',
  '',
  '== JSON PLAN RULES ==',
  'ALL prices in Indian Rupees (INR). Never use USD.',
  'Generate 2-3 plan variants (Adventure, Cultural, Relaxed).',
  'Each plan: day-wise itinerary (3-5 activities/day), 3+ attractions, transport links, hotels if budget allows.',
  'Approved transport links (use ONLY these):',
  '  IRCTC: https://www.irctc.co.in/',
  '  RedBus: https://www.redbus.in/',
  '  IndiGo: https://www.goindigo.in/',
  '  Air India: https://www.airindia.com/',
  '  Skyscanner: https://www.skyscanner.com/',
  '  Google Flights: https://www.google.com/travel/flights',
  '  Uber: https://www.uber.com/',
  '  Ola: https://www.olacabs.com/',
  '',
  'JSON schema (output ONLY this — no surrounding text — when generating a plan):',
  '{',
  '  "feasible": boolean,',
  '  "summary": string,',
  '  "origin": string,',
  '  "destination": string,',
  '  "budget": { "currency": "INR", "total_estimate": number, "breakdown": { "transport": number, "lodging": number, "food": number, "local_transport": number } },',
  '  "plans": [{ "label": string, "itinerary": [{ "day": number, "plan": string[] }], "transport": [{ "type": string, "provider": string, "link": string }], "attractions": string[], "hotels": [{ "name": string, "area": string, "approx_price": string }] }],',
  '  "alternatives": string[],',
  '  "notes": string[]',
  '}',
  '',
  'For all other messages: reply in friendly plain text only. No JSON.'
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

  // Reply logic:
  // - If parsed plan exists and has a summary → show summary (clean readable text)
  // - If parsed plan exists but no summary → show generic message
  //   (NEVER fall back to rawContent when parsed is set — rawContent may contain raw JSON)
  // - If nothing was parsed → rawContent is plain conversational text, show as-is
  const reply = parsed
    ? (typeof parsed.summary === 'string' && parsed.summary.trim()
      ? parsed.summary
      : 'Here are your travel plan options.')
    : rawContent || 'I am here to help with your travel plans.';

  return {
    reply,
    data: parsed ? (parsed as unknown as import('./chatTypes').ChatPlanResponse) : undefined,
    raw: rawContent
  };
};
