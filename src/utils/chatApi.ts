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
  'olacabs.com',
  'booking.com'
];

type KnownTripContext = {
  origin?: string;
  destination?: string;
  budgetInr?: number;
  travelers?: number;
  days?: number;
};

type GeneralTalkIntent = 'greeting' | 'thanks' | 'farewell' | null;

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

  // Always include a multimodal planner for flight/train/bus/ferry combinations.
  links.push({
    provider: 'Rome2Rio',
    type: 'Multimodal',
    url: `https://www.rome2rio.com/map/${from}/${to}`,
    note: 'Compare flight, train, bus and ferry routes'
  });

  // Always surface core ground/water/local options in the UI.
  links.push({
    provider: 'IRCTC',
    type: 'Train',
    url: 'https://www.irctc.co.in/nget/train-search',
    note: 'Check train options for intercity legs'
  });

  links.push({
    provider: 'Redbus',
    type: 'Bus',
    url: `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}/`,
    note: 'Check bus options and schedules'
  });

  links.push({
    provider: 'Rome2Rio',
    type: 'Ferry/Boat',
    url: `https://www.rome2rio.com/map/${from}/${to}`,
    note: 'Check if ferry/boat legs are available on this route'
  });

  links.push({
    provider: 'Uber',
    type: 'Local Transfer',
    url: 'https://www.uber.com/',
    note: 'City transfer and last-mile rides'
  });

  links.push({
    provider: 'Ola',
    type: 'Local Transfer',
    url: 'https://www.olacabs.com/',
    note: 'Local cabs in Indian cities'
  });

  if (isInternational) {
    // International routes usually include flight + local transfers.
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
    // Domestic routes can include flight legs as one of multiple options.
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
  }

  // Hotel booking (nearby stays at destination)
  links.push({
    provider: 'Booking.com',
    type: 'Hotel',
    url: `https://www.booking.com/searchresults.html?ss=${to}`,
    note: 'Find nearby hotels and book your stay'
  });

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
  'You are WanderMate AI, an agentic travel planner for travelers.',
  'Your role is to gather missing details, remember conversation context, and build practical itineraries.',
  '',
  '== CORE BEHAVIOR ==',
  'Always retain previous context from this conversation (origin, destination, dates, budget, preferences, constraints).',
  'Never reset or restart context unless the user clearly asks to change trip details.',
  'If user corrects a detail, update the plan using the corrected detail.',
  'If trip details are incomplete, ask only the single most important missing question.',
  'Never assume the user\'s starting point (origin city/country) if it is not explicitly provided.',
  'If destination is given but origin is missing, ask: "What is your starting city?" before finalizing the plan.',
  'Avoid flight-only bias. Choose the best realistic transport mix.',
  '',
  '== RESPONSE FORMAT ==',
  'Never use emojis in any output.',
  'Keep language concise and practical. Avoid long disclaimers and filler.',
  'Use plain conversational text only for greetings or when asking one missing detail.',
  'Output JSON for travel guidance once route context is known.',
  '',
  '== WHEN TO OUTPUT JSON ==',
  'Output JSON when origin and destination are known OR user asks route details/cost/time/transport options.',
  'For greetings or small talk, do not output JSON.',
  '',
  '== ANTI-HALLUCINATION RULES ==',
  'Do not invent real-time prices, seat availability, or schedules.',
  'Use estimated INR ranges and clearly mark them as estimates.',
  'Prefer realistic transport options; do not suggest impossible main-route transport.',
  'Support all major transport modes when relevant: flight, train, bus, ferry/boat, metro, taxi and walking legs.',
  '',
  '== JSON PLAN RULES ==',
  'ALL prices in INR.',
  'Include day-wise itinerary suitable for rendering as Day 1/Day 2/Day 3 sections.',
  'Generate 2-3 plan variants when possible.',
  'For each plan, include transport options beyond flights whenever feasible (train, bus, ferry/boat, local transfers).',
  'If route includes islands/coastal legs, include ferry/boat option in transport array.',
  'Use only approved transport/booking links:',
  'IRCTC https://www.irctc.co.in/',
  'RedBus https://www.redbus.in/',
  'IndiGo https://www.goindigo.in/',
  'Air India https://www.airindia.com/',
  'Skyscanner https://www.skyscanner.com/',
  'Google Flights https://www.google.com/travel/flights',
  'Uber https://www.uber.com/',
  'Ola https://www.olacabs.com/',
  'Booking.com https://www.booking.com/',
  '',
  'JSON schema (strict):',
  '{',
  '  "feasible": boolean,',
  '  "summary": string,',
  '  "origin": string,',
  '  "destination": string,',
  '  "budget": { "currency": "INR", "total_estimate": number, "breakdown": { "transport": number, "lodging": number, "food": number, "local_transport": number } },',
  '  "plans": [{ "label": string, "itinerary": [{ "day": number, "plan": string[] }], "transport": [{ "type": string, "provider": string, "link": string }], "attractions": string[], "hotels": [{ "name": string, "area": string, "approx_price": string }] }],',
  '  "alternatives": string[],',
  '  "notes": string[]',
  '}'
].join('\n');

const cleanPlace = (value: string) => value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim();

const stripEmojis = (text: string) =>
  text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const parseKnownContext = (request: ChatRequest): KnownTripContext => {
  const context: KnownTripContext = {};
  const userMessages = [
    ...(request.history || []).filter((h) => h.role === 'user').map((h) => h.content || ''),
    request.message || ''
  ];

  const patterns = [
    /from\s+([a-zA-Z\s]{2,40}?)\s+to\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i,
    /\b([a-zA-Z\s]{2,40}?)\s+to\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i,
    /between\s+([a-zA-Z\s]{2,40}?)\s+and\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i
  ];

  userMessages.forEach((message) => {
    const text = message || '';

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const origin = cleanPlace(match[1]);
        const destination = cleanPlace(match[2]);
        if (origin && destination) {
          context.origin = origin;
          context.destination = destination;
          break;
        }
      }
    }

    const budgetMatch = text.match(/(?:₹|rs\.?|inr)\s*([0-9][0-9,]*)|budget\s*(?:is|of|around)?\s*([0-9][0-9,]*)/i);
    if (budgetMatch) {
      const raw = (budgetMatch[1] || budgetMatch[2] || '').replace(/,/g, '');
      const value = Number(raw);
      if (!Number.isNaN(value) && value > 0) {
        context.budgetInr = value;
      }
    }

    const travelersMatch = text.match(/(\d+)\s*(?:traveler|travellers|people|persons)/i);
    if (travelersMatch) {
      const value = Number(travelersMatch[1]);
      if (!Number.isNaN(value) && value > 0) {
        context.travelers = value;
      }
    }

    const daysMatch = text.match(/(\d+)\s*(?:day|days)/i);
    if (daysMatch) {
      const value = Number(daysMatch[1]);
      if (!Number.isNaN(value) && value > 0) {
        context.days = value;
      }
    }
  });

  return context;
};

const detectGeneralTalkIntent = (message: string): GeneralTalkIntent => {
  const text = (message || '').trim().toLowerCase();
  if (!text) return null;

  const greetingRegex = /^(hi|hii|hello|hey|good morning|good afternoon|good evening)([\s!.,?].*)?$/i;
  const thanksRegex = /^(thanks|thank you|thankyou|thx|ty)([\s!.,?].*)?$/i;
  const farewellRegex = /^(bye|goodbye|see you|see you later|talk to you later|gn|good night|bye bye)([\s!.,?].*)?$/i;

  if (greetingRegex.test(text)) return 'greeting';
  if (thanksRegex.test(text)) return 'thanks';
  if (farewellRegex.test(text)) return 'farewell';

  return null;
};

const generalTalkReply = (intent: Exclude<GeneralTalkIntent, null>) => {
  if (intent === 'greeting') {
    return 'Hi. I can help with trip ideas, routes, budgets, or quick travel questions.';
  }
  if (intent === 'thanks') {
    return 'You are welcome. If you want, I can help with your next trip as well.';
  }
  return 'Bye. Have a great day and travel safe.';
};

const buildUserPrompt = (request: ChatRequest, known: KnownTripContext) => {
  const lines: string[] = [];

  if (known.origin || known.destination || known.budgetInr || known.travelers || known.days) {
    lines.push('Known conversation context:');
    if (known.origin) lines.push(`- Origin: ${known.origin}`);
    if (known.destination) lines.push(`- Destination: ${known.destination}`);
    if (known.budgetInr) lines.push(`- Budget: ${known.budgetInr} INR`);
    if (known.travelers) lines.push(`- Travelers: ${known.travelers}`);
    if (known.days) lines.push(`- Days: ${known.days}`);
  }

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

  if (known.origin && known.destination) {
    lines.push('Instruction: Origin and destination are already known from context.');
    lines.push('Do not ask for them again. Return a complete JSON travel plan now.');
  } else if (!known.origin && known.destination) {
    lines.push('Instruction: Destination is known but origin is missing.');
    lines.push('Ask exactly one question to get the starting city. Do not assume origin.');
  }

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

const createFallbackPlan = (known: KnownTripContext): Record<string, unknown> => {
  const origin = known.origin || 'Origin';
  const destination = known.destination || 'Destination';
  const days = Math.max(known.days || 2, 2);
  const total = Math.max(known.budgetInr || 9000, 4000);
  const international = isInternationalTrip(origin, destination);

  const bookingLinks = generateBookingLinks(origin, destination, international)
    .filter((item) => item.type !== 'Hotel')
    .slice(0, 6)
    .map((item) => ({
      type: item.type,
      provider: item.provider,
      link: item.url
    }));

  const perDaySample = [
    `Start from ${origin} and reach ${destination} using your preferred mode.`,
    `Explore key attractions and local food spots in ${destination}.`,
    'Keep one flexible slot for weather or traffic changes.'
  ];

  const itinerary = Array.from({ length: days }, (_, idx) => ({
    day: idx + 1,
    plan: [perDaySample[Math.min(idx, perDaySample.length - 1)]]
  }));

  const transportEstimate = Math.round(total * 0.42);
  const lodgingEstimate = Math.round(total * 0.3);
  const foodEstimate = Math.round(total * 0.18);
  const localEstimate = Math.max(total - (transportEstimate + lodgingEstimate + foodEstimate), 0);

  return {
    feasible: true,
    summary: `Here is a practical ${origin} to ${destination} plan with estimate ranges in INR.`,
    origin,
    destination,
    budget: {
      currency: 'INR',
      total_estimate: total,
      breakdown: {
        transport: transportEstimate,
        lodging: lodgingEstimate,
        food: foodEstimate,
        local_transport: localEstimate
      }
    },
    plans: [
      {
        label: 'Balanced Plan',
        itinerary,
        transport: bookingLinks,
        attractions: ['Main city landmarks', 'Local market walk', 'Evening viewpoint'],
        hotels: [{ name: 'Well-rated central stay', area: destination, approx_price: 'INR 1800-3200 per night' }]
      }
    ],
    alternatives: ['Increase budget by 15-20% for weekend peak dates.', 'Reduce one hotel night for tighter budgets.'],
    notes: ['Costs are estimates and may vary by season and booking time.']
  };
};

const toBriefReply = (text: string) => {
  const normalized = stripEmojis(text.replace(/\s+/g, ' ').trim());
  if (!normalized) {
    return 'I am here to help with your travel plans.';
  }

  // Return full response text without length clipping.
  return normalized;
};

const requestGroqCompletion = async (messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 1400,
      messages
    })
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Groq API request failed (${response.status}). ${responseText}`);
  }

  try {
    const parsedPayload = JSON.parse(responseText) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return parsedPayload?.choices?.[0]?.message?.content?.trim() || '';
  } catch {
    return responseText;
  }
};

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatApiResponse> => {
  if (!GROQ_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY.');
  }

  const smallTalkIntent = detectGeneralTalkIntent(payload.message || '');
  if (smallTalkIntent) {
    return {
      reply: generalTalkReply(smallTalkIntent),
      data: undefined,
      raw: generalTalkReply(smallTalkIntent)
    };
  }

  const known = parseKnownContext(payload);
  const userPrompt = buildUserPrompt(payload, known);
  const history = Array.isArray(payload.history) ? payload.history.slice(-24) : [];

  let rawContent = await requestGroqCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userPrompt }
  ]);

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = extractJson(rawContent);
  } catch {
    parsed = null;
  }

  const shouldForcePlan = Boolean(known.origin && known.destination);
  if (!parsed && shouldForcePlan) {
    const repairPrompt = [
      'Return ONLY valid JSON following the required schema.',
      'Do not ask any question.',
      `Origin: ${known.origin}`,
      `Destination: ${known.destination}`,
      known.budgetInr ? `Budget INR: ${known.budgetInr}` : '',
      known.travelers ? `Travelers: ${known.travelers}` : '',
      known.days ? `Days: ${known.days}` : '',
      `Latest user message: ${payload.message || ''}`,
      'Use realistic estimates and include day-wise itinerary in plans[].itinerary.',
      'JSON only.'
    ].filter(Boolean).join('\n');

    const retryContent = await requestGroqCompletion([
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: repairPrompt }
    ]);

    try {
      parsed = extractJson(retryContent);
      rawContent = retryContent;
    } catch {
      // One more strict retry to avoid plain text fallback for known routes.
      const hardRetryPrompt = [
        'Return ONLY valid JSON. Any non-JSON output is invalid.',
        'No markdown. No explanations. No emojis.',
        `Origin: ${known.origin}`,
        `Destination: ${known.destination}`,
        known.budgetInr ? `Budget INR: ${known.budgetInr}` : '',
        known.travelers ? `Travelers: ${known.travelers}` : '',
        known.days ? `Days: ${known.days}` : '',
        `Latest user message: ${payload.message || ''}`,
        'Must include feasible, summary, origin, destination, budget, plans, alternatives, notes.',
        'plans must include itinerary day arrays and transport links from approved domains only.',
        'JSON only.'
      ].filter(Boolean).join('\n');

      const hardRetryContent = await requestGroqCompletion([
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: hardRetryPrompt }
      ]);

      try {
        parsed = extractJson(hardRetryContent);
        rawContent = hardRetryContent;
      } catch {
        parsed = createFallbackPlan(known);
        rawContent = '';
      }
    }
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
      ? stripEmojis(parsed.summary)
      : 'Here are your travel plan options.')
    : toBriefReply(rawContent);

  return {
    reply,
    data: parsed ? (parsed as unknown as import('./chatTypes').ChatPlanResponse) : undefined,
    raw: rawContent
  };
};
