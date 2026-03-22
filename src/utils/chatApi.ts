import { ChatApiResponse, ChatRequest } from './chatTypes';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL || 'llama-3.1-8b-instant';

// ── Constants ─────────────────────────────────────────────────────────────────

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
] as const;

const LANDLOCKED_KEYWORDS = [
  'delhi', 'jaipur', 'agra', 'lucknow', 'bhopal', 'indore', 'nagpur',
  'chandigarh', 'amritsar', 'jodhpur', 'ajmer', 'pushkar', 'varanasi',
  'patna', 'aurangabad', 'hyderabad', 'ahmedabad', 'surat', 'rajkot'
];

const INDIAN_PLACE_IDENTIFIERS = [
  'mumbai', 'delhi', 'new delhi', 'bangalore', 'bengaluru', 'chennai', 'kolkata',
  'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'goa', 'kochi', 'amritsar',
  'varanasi', 'agra', 'udaipur', 'mysore', 'mysuru', 'surat', 'lucknow',
  'nagpur', 'bhopal', 'indore', 'patna', 'chandigarh', 'salem',
  'manali', 'shimla', 'darjeeling', 'leh', 'ladakh', 'rishikesh', 'haridwar',
  'coimbatore', 'madurai', 'vizag', 'visakhapatnam', 'rajkot', 'jodhpur',
  'ajmer', 'pushkar', 'hampi', 'ooty', 'munnar', 'alleppey', 'alappuzha',
  'kodaikanal', 'aurangabad', 'siliguri', 'guwahati', 'shillong', 'imphal',
  'kohima', 'aizawl', 'itanagar', 'gangtok', 'port blair', 'andaman',
  'pondicherry', 'puducherry', 'thrissur', 'kozhikode', 'calicut', 'mangalore',
  'hubli', 'belgaum', 'belagavi', 'nashik', 'kolhapur', 'solapur', 'jamshedpur',
  'ranchi', 'bhubaneswar', 'cuttack', 'raipur', 'bilaspur', 'jabalpur',
  'gwalior', 'mathura', 'vrindavan', 'dehradun', 'mussoorie', 'nainital',
  'jim corbett', 'corbett', 'ranthambore', 'jaisalmer', 'bikaner', 'mount abu',
  'dwarka', 'somnath', 'vadodara', 'srinagar', 'jammu', 'katra', 'vaishno devi',
  'spiti', 'kasol', 'mcleod ganj', 'dharamsala', 'dalhousie', 'khajuraho',
  'orchha', 'pachmarhi', 'mandu', 'tirupati', 'vijayawada', 'nellore',
  'warangal', 'tirunelveli', 'trichy', 'tiruchirappalli', 'thanjavur', 'tanjore',
  'mahabalipuram', 'mamallapuram',
  'kerala', 'rajasthan', 'himachal', 'uttarakhand', 'sikkim', 'meghalaya',
  'assam', 'manipur', 'mizoram', 'nagaland', 'arunachal', 'tripura',
  'gujarat', 'maharashtra', 'karnataka', 'tamilnadu', 'tamil nadu', 'andhra',
  'telangana', 'odisha', 'orissa', 'jharkhand', 'chhattisgarh', 'madhya pradesh',
  'uttar pradesh', 'bihar', 'west bengal', 'punjab', 'haryana'
];

// ── Feasibility Limits ────────────────────────────────────────────────────────

const FEASIBILITY = {
  MAX_DAYS: 60,
  MIN_BUDGET_DOMESTIC_INR: 2000,
  MIN_BUDGET_INTL_INR: 30000,
  MAX_BUDGET_SANITY_INR: 10_000_000
} as const;

const LONG_TRIP_SIMPLIFY_FROM_DAYS = 15;

// ── Types ─────────────────────────────────────────────────────────────────────

type KnownTripContext = {
  origin?: string;
  destination?: string;
  budgetInr?: number;
  travelers?: number;
  days?: number;
  preferredTransport?: string;
};

// Tracks which fields have already been asked this session
type AskedFields = {
  days?: boolean;
  budget?: boolean;
  travelers?: boolean;
  transport?: boolean;
};

type FeasibilityResult = { ok: true } | { ok: false; reply: string };

type GeneralTalkIntent = 'greeting' | 'thanks' | 'farewell' | null;
type GroqMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface BookingLink {
  provider: string;
  type: string;
  url: string;
  note: string;
}

// ── Input Sanitization ────────────────────────────────────────────────────────

const sanitizeUserInput = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi, '')
    .replace(/you\s+are\s+now\s+(?:a|an)\s+/gi, '')
    .replace(/forget\s+(?:all\s+)?(?:your\s+)?(?:previous\s+)?(?:instructions?|context)/gi, '')
    .replace(/system\s*prompt/gi, '')
    .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '')
    .slice(0, 2000)
    .trim();
};

const cleanPlace = (value: string) =>
  value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim();

const stripEmojis = (text: string) =>
  text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

// ── International Detection ───────────────────────────────────────────────────

export const isInternationalTrip = (origin: string, destination: string): boolean => {
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();
  const originIsIndian = INDIAN_PLACE_IDENTIFIERS.some((id) => originLower.includes(id));
  const destIsIndian = INDIAN_PLACE_IDENTIFIERS.some((id) => destLower.includes(id));
  // Both Indian → domestic; one or neither Indian → international
  return !(originIsIndian && destIsIndian);
};

const isLandlockedRoute = (origin: string, destination: string): boolean => {
  const combined = `${origin} ${destination}`.toLowerCase();
  return LANDLOCKED_KEYWORDS.some((kw) => combined.includes(kw));
};

// ── Feasibility Validation ────────────────────────────────────────────────────

/**
 * Hard-checks obvious impossibilities BEFORE calling the LLM.
 * Returns a clear correction message so the bot never asks follow-up
 * questions on inputs that don't make sense.
 */
const checkFeasibility = (
  known: KnownTripContext,
  isInternational: boolean
): FeasibilityResult => {
  const { days, budgetInr, origin, destination } = known;

  if (days !== undefined && days <= 0) {
    return {
      ok: false,
      reply: 'A 0-day trip cannot be planned. Please share at least 1 day for your trip.'
    };
  }

  if (days !== undefined && days > FEASIBILITY.MAX_DAYS) {
    return {
      ok: false,
      reply:
        `${days} days is unusually long for a single trip. Most trips are under ${FEASIBILITY.MAX_DAYS} days. ` +
        `Did you mean ${days} nights, or a shorter number of days?`
    };
  }

  if (budgetInr !== undefined && origin && destination) {
    const minBudget = isInternational
      ? FEASIBILITY.MIN_BUDGET_INTL_INR
      : FEASIBILITY.MIN_BUDGET_DOMESTIC_INR;

    if (budgetInr < minBudget) {
      return {
        ok: false,
        reply:
          `INR ${budgetInr.toLocaleString('en-IN')} is not enough for a trip from ${origin} to ${destination}. ` +
          (isInternational
            ? `International trips typically need at least INR ${FEASIBILITY.MIN_BUDGET_INTL_INR.toLocaleString('en-IN')} for flights alone.`
            : `Even a short domestic trip costs at least INR ${FEASIBILITY.MIN_BUDGET_DOMESTIC_INR.toLocaleString('en-IN')}.`) +
          ` What is your revised budget in INR?`
      };
    }

    if (budgetInr > FEASIBILITY.MAX_BUDGET_SANITY_INR) {
      return {
        ok: false,
        reply:
          `INR ${budgetInr.toLocaleString('en-IN')} seems unusually high. ` +
          `Could you confirm the amount?`
      };
    }
  }

  return { ok: true };
};

// ── Booking Link Builder ──────────────────────────────────────────────────────

export const generateBookingLinks = (
  origin: string,
  destination: string,
  isInternational: boolean
): BookingLink[] => {
  const from = encodeURIComponent(origin);
  const to = encodeURIComponent(destination);
  const fromSlug = origin.toLowerCase().replace(/\s+/g, '-');
  const toSlug = destination.toLowerCase().replace(/\s+/g, '-');
  const landlocked = isLandlockedRoute(origin, destination);
  const links: BookingLink[] = [];

  links.push({ provider: 'Rome2Rio', type: 'Multimodal', url: `https://www.rome2rio.com/map/${from}/${to}`, note: 'Compare flight, train, bus and ferry routes' });
  links.push({ provider: 'IRCTC', type: 'Train', url: 'https://www.irctc.co.in/nget/train-search', note: 'Check train options for intercity legs' });
  links.push({ provider: 'Redbus', type: 'Bus', url: `https://www.redbus.in/bus-tickets/${fromSlug}-to-${toSlug}/`, note: 'Check bus options and schedules' });

  if (!landlocked) {
    links.push({ provider: 'Rome2Rio', type: 'Ferry/Boat', url: `https://www.rome2rio.com/map/${from}/${to}`, note: 'Check if ferry/boat legs are available on this route' });
  }

  if (isInternational) {
    links.push({ provider: 'Skyscanner', type: 'Flight', url: `https://www.skyscanner.co.in/flights/${from}/${to}/`, note: 'Compare live flight prices' });
    links.push({ provider: 'Google Flights', type: 'Flight', url: `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}&hl=en`, note: 'Search live flights on Google' });
    links.push({ provider: 'Air India', type: 'Flight', url: 'https://www.airindia.com/', note: 'Book Air India flights' });
    links.push({ provider: 'IndiGo', type: 'Flight', url: 'https://www.goindigo.in/', note: 'Book IndiGo flights' });
  } else {
    links.push({ provider: 'IndiGo', type: 'Flight', url: 'https://www.goindigo.in/', note: 'Book IndiGo domestic flights' });
    links.push({ provider: 'Skyscanner', type: 'Flight', url: `https://www.skyscanner.co.in/flights/${from}/${to}/`, note: 'Compare domestic flight prices' });
  }

  links.push({ provider: 'Uber', type: 'Local Transfer', url: 'https://www.uber.com/', note: 'City transfer and last-mile rides' });
  links.push({ provider: 'Ola', type: 'Local Transfer', url: 'https://www.olacabs.com/', note: 'Local cabs in Indian cities' });
  links.push({ provider: 'Booking.com', type: 'Hotel', url: `https://www.booking.com/searchresults.html?ss=${to}`, note: 'Find nearby hotels and book your stay' });

  return links;
};

// ── System Prompt ─────────────────────────────────────────────────────────────

/**
 * The system prompt is fully context-aware:
 * - Lists CONFIRMED fields so the LLM never re-asks them
 * - Lists ALREADY ASKED fields so the LLM picks the next un-asked one
 * - Specifies the EXACT next question to ask (one at a time)
 * - Travelers is collected as the second question (after days)
 */
const buildSystemPrompt = (ctx: {
  isInternational: boolean;
  known: KnownTripContext;
  askedFields: AskedFields;
}): string => {
  const { isInternational, known, askedFields } = ctx;

  const confirmedLines: string[] = [];
  if (known.origin) confirmedLines.push(`- Origin: ${known.origin} (CONFIRMED, never ask again)`);
  if (known.destination) confirmedLines.push(`- Destination: ${known.destination} (CONFIRMED, never ask again)`);
  if (known.days) confirmedLines.push(`- Days: ${known.days} (CONFIRMED, never ask again)`);
  if (known.travelers) confirmedLines.push(`- Travelers: ${known.travelers} (CONFIRMED, never ask again)`);
  if (known.budgetInr) confirmedLines.push(`- Budget: INR ${known.budgetInr} (CONFIRMED, never ask again)`);
  if (known.preferredTransport) confirmedLines.push(`- Transport preference: ${known.preferredTransport} (CONFIRMED, never ask again)`);

  const alreadyAsked: string[] = [];
  if (askedFields.days) alreadyAsked.push('days');
  if (askedFields.travelers) alreadyAsked.push('number of travelers');
  if (askedFields.budget) alreadyAsked.push('budget');
  if (askedFields.transport) alreadyAsked.push('transport preference');

  // Priority order: days → travelers → budget → transport
  // Once all are known, the LLM should output JSON
  let nextQuestion = '';
  if (!known.days && !askedFields.days) nextQuestion = 'How many days is this trip?';
  else if (!known.travelers && !askedFields.travelers) nextQuestion = 'How many people are traveling (including yourself)?';
  else if (!known.budgetInr && !askedFields.budget) nextQuestion = 'What is your total budget for this trip in INR?';
  else if (!known.preferredTransport && !askedFields.transport) nextQuestion = 'Do you prefer flight, train, or bus for the main journey?';

  return [
    'You are WanderMate AI, an agentic travel planner.',
    isInternational
      ? 'This is an INTERNATIONAL trip. Prioritize flight options and mention visa and passport requirements.'
      : 'This is a DOMESTIC trip within India.',
    '',
    '== CONFIRMED TRIP DETAILS (NEVER ask about these again) ==',
    confirmedLines.length ? confirmedLines.join('\n') : 'None confirmed yet.',
    '',
    alreadyAsked.length
      ? `== ALREADY ASKED THIS SESSION (do NOT ask again): ${alreadyAsked.join(', ')} ==`
      : '',
    '',
    nextQuestion
      ? `== YOUR ONLY JOB RIGHT NOW: Ask exactly this one question, nothing else ==\n"${nextQuestion}"`
      : '== ALL REQUIRED DETAILS ARE CONFIRMED. Output a full JSON travel plan now. ==',
    '',
    '== STRICT RULES ==',
    'NEVER ask about a field listed under CONFIRMED above.',
    'NEVER ask more than one question per response.',
    'If trip duration is 15 days or more, keep itinerary concise by grouping days into phases instead of detailing every day.',
    'NEVER ask for currency clarification — always treat numbers as INR.',
    'NEVER ask if the user wants budget or full-service airlines.',
    'NEVER ask about direct vs layover flights as a separate question.',
    'If the user replies with a number and you asked about days, that number IS the days.',
    'If the user replies with a number and you asked about budget, that number IS the budget in INR.',
    'If the user replies with a number and you asked about travelers, that number IS the traveler count.',
    'Accept "okay", "yes", "fine", "sure" as confirmation of the last stated value.',
    'If you output JSON, output ONLY JSON. No markdown, no code fences, no extra text.',
    '',
    '== WHEN TO OUTPUT JSON ==',
    'Output JSON ONLY when origin, destination, days, travelers, and budget are ALL confirmed.',
    'Do not output JSON while any of those five fields is missing.',
    '',
    '== JSON FORMAT ==',
    'No emojis. All prices in INR. Include day-wise itinerary. Generate 2-3 plan variants.',
    'Use only these approved booking links: IRCTC, RedBus, IndiGo, Air India, Skyscanner, Google Flights, Uber, Ola, Booking.com.',
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
  ].filter((l) => l !== '').join('\n');
};

// ── Context Parsing ───────────────────────────────────────────────────────────

/**
 * Extracts known trip fields from the full conversation history.
 * Fields are SET ONCE and never overwritten — earlier confirmations win.
 * `lastAskedField` resolves bare number replies like "5" or "10000".
 */
const parseKnownContext = (
  request: ChatRequest,
  lastAskedField?: keyof AskedFields
): KnownTripContext => {
  const context: KnownTripContext = {};

  const allMessages = [
    ...(request.history || []).filter((h) => h.role === 'user').map((h) => sanitizeUserInput(h.content || '')),
    sanitizeUserInput(request.message || '')
  ];

  const currentMessage = sanitizeUserInput(request.message || '');

  const routePatterns = [
    /(?:from|leaving|departing|starting\s+(?:from|in))\s+([a-zA-Z\s]{2,40}?)\s+(?:to|towards|going\s+to|heading\s+to)\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i,
    /\b([a-zA-Z\s]{2,40}?)\s+to\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i,
    /between\s+([a-zA-Z\s]{2,40}?)\s+and\s+([a-zA-Z\s]{2,40})(?:[\s,.!?]|$)/i
  ];

  for (const message of allMessages) {
    // Route
    if (!context.origin || !context.destination) {
      for (const pattern of routePatterns) {
        const match = message.match(pattern);
        if (match) {
          const origin = match[1] ? cleanPlace(match[1]) : '';
          const destination = match[2] ? cleanPlace(match[2]) : '';
          if (origin && destination && !context.origin) {
            context.origin = origin;
            context.destination = destination;
            break;
          }
        }
      }
    }

    // Budget (allow corrections; latest mention wins)
    const budgetMatch = message.match(
      /(?:₹|rs\.?|inr)\s*([0-9][0-9,]*(?:\.\d+)?)|(?:budget|spend|cost|money)\s*(?:is|of|around|about|under|below|within|total|maximum|max)?\s*(?:is\s+)?(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*(?:\.\d+)?)/i
    );
    if (budgetMatch) {
      const raw = (budgetMatch[1] || budgetMatch[2] || '').replace(/,/g, '');
      const value = Number(raw);
      if (!Number.isNaN(value) && value > 0) context.budgetInr = value;
    }
    // "10k" shorthand
    const kMatch = message.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      const value = parseFloat(kMatch[1]) * 1000;
      if (!Number.isNaN(value) && value > 0) context.budgetInr = value;
    }

    // Travelers (allow corrections)
    const travelersMatch = message.match(
      /(\d+)\s*(?:travell?ers?|people|persons?|adults?|pax|passengers?|members?|friends?|of\s+us|with\s+me)/i
    );
    const familyMatch = message.match(/family\s+of\s+(\d+)/i);
    const soloMatch = /\b(?:solo|alone|myself|just\s+me)\b/i.test(message);
    const coupleMatch = /\b(?:couple|two\s+of\s+us|both\s+of\s+us)\b/i.test(message);

    if (travelersMatch) context.travelers = Number(travelersMatch[1]);
    else if (familyMatch) context.travelers = Number(familyMatch[1]);
    else if (soloMatch) context.travelers = 1;
    else if (coupleMatch) context.travelers = 2;

    // Days (allow corrections)
    const daysMatch = message.match(/(\d+)\s*(?:days?|nights?)/i);
    const weekMatch = message.match(/(\d+)\s*weeks?/i);
    const weekendMatch = /\bweekend\b/i.test(message);
    if (daysMatch) context.days = Number(daysMatch[1]);
    else if (weekMatch) context.days = Number(weekMatch[1]) * 7;
    else if (weekendMatch) context.days = 2;

    // Transport (allow corrections)
    const transportMatch = message.match(
      /\b(flights?|trains?|buses?|car|cab|taxi|self[\s-]?drive|bike|scooter|walk(?:ing)?)\b/i
    );
    if (transportMatch) context.preferredTransport = transportMatch[1].toLowerCase();
  }

  // Bare number resolution — e.g. user replies "5" after bot asked "How many days?"
  const bareNumberMatch = currentMessage.match(/^\s*(\d[\d,]*)\s*$/);
  if (bareNumberMatch) {
    const value = Number(bareNumberMatch[1].replace(/,/g, ''));
    if (!Number.isNaN(value) && value >= 0) {
      if (lastAskedField === 'days' && !context.days) context.days = value;
      else if (lastAskedField === 'budget' && !context.budgetInr) context.budgetInr = value;
      else if (lastAskedField === 'travelers' && !context.travelers) context.travelers = value;
    }
  }

  return context;
};

// ── Asked Field Tracker ───────────────────────────────────────────────────────

/**
 * Scans assistant messages in history to reconstruct which fields
 * have already been asked. Prevents any field from being asked twice.
 */
const deriveAskedFields = (history: GroqMessage[]): AskedFields => {
  const asked: AskedFields = {};
  for (const msg of history.filter((h) => h.role === 'assistant')) {
    const c = msg.content.toLowerCase();
    if (/how many days|number of days|how long.{0,20}trip|duration/i.test(c)) asked.days = true;
    if (/how many.{0,20}(people|travelers|members|persons|travelling|traveling)/i.test(c)) asked.travelers = true;
    if (/budget|how much.{0,20}spend|total cost|your budget/i.test(c)) asked.budget = true;
    if (/prefer.{0,20}(flight|train|bus)|mode of transport|how.{0,20}travel/i.test(c)) asked.transport = true;
  }
  return asked;
};

/**
 * Looks at the last assistant message to resolve what field
 * a bare-number reply (e.g. "5") refers to.
 */
const getLastAskedField = (history: GroqMessage[]): keyof AskedFields | undefined => {
  const last = [...history].reverse().find((h) => h.role === 'assistant');
  if (!last) return undefined;
  const c = last.content.toLowerCase();
  if (/how many days|number of days|how long.{0,20}trip|duration/i.test(c)) return 'days';
  if (/how many.{0,20}(people|travelers|members|persons|travelling|traveling)/i.test(c)) return 'travelers';
  if (/budget|how much.{0,20}spend|total cost|your budget/i.test(c)) return 'budget';
  if (/prefer.{0,20}(flight|train|bus)|mode of transport/i.test(c)) return 'transport';
  return undefined;
};

// ── Intent Detection ──────────────────────────────────────────────────────────

const hasTravelIntentKeywords = (message: string): boolean =>
  /(trip|travel|itinerary|plan|route|from\s+.+\s+to\s+.+|budget|ticket|book(?:ing)?|flight|train|bus|hotel|visa|\d+\s*days?)/i.test(message);

const hasExplicitPlanRequest = (message: string): boolean =>
  /(full\s+plan|full\s+itinerary|complete\s+plan|detailed\s+itinerary|give\s+(?:me\s+)?(?:a\s+|an\s+)?itinerary|create\s+(?:a\s+)?plan|make\s+(?:a\s+)?plan)/i.test(message);

const detectGeneralTalkIntent = (message: string): GeneralTalkIntent => {
  const text = (message || '').trim().toLowerCase();
  if (!text || hasTravelIntentKeywords(text)) return null;
  if (/\b(thanks|thank\s+you|thankyou|thx|ty)\b/i.test(text)) return 'thanks';
  if (/\b(bye|goodbye|see\s+you|talk\s+to\s+you\s+later|good\s+night|gn)\b/i.test(text)) return 'farewell';
  if (/\b(hi+|hello|hey|good\s+(?:morning|afternoon|evening))\b/i.test(text)) return 'greeting';
  return null;
};

const generalTalkReply = (intent: Exclude<GeneralTalkIntent, null>): string => {
  if (intent === 'greeting') return 'Hi. I can help with trip ideas, routes, budgets, or quick travel questions.';
  if (intent === 'thanks') return 'You are welcome. If you want, I can help with your next trip as well.';
  return 'Bye. Have a great day and travel safe.';
};

// ── JSON Utilities ────────────────────────────────────────────────────────────

const extractJson = (text: string): [Record<string, unknown> | null, Error | null] => {
  const trimmed = (text || '').trim();
  if (!trimmed) return [null, new Error('Empty string')];
  const withoutFences = trimmed
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  let jsonStr: string | null = null;
  if (withoutFences.startsWith('{') && withoutFences.endsWith('}')) jsonStr = withoutFences;
  else {
    const start = withoutFences.indexOf('{');
    const end = withoutFences.lastIndexOf('}');
    if (start >= 0 && end > start) jsonStr = withoutFences.slice(start, end + 1);
  }
  if (!jsonStr) return [null, new Error('No JSON object found in text')];
  try {
    return [JSON.parse(jsonStr) as Record<string, unknown>, null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
};

const isAllowedLink = (link: string): boolean => {
  try {
    const url = new URL(link);
    return ALLOWED_TRANSPORT_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
};

const sanitizeTransportLinks = (data: Record<string, unknown>): Record<string, unknown> => {
  const rawPlans = (data as { plans?: unknown }).plans;
  if (!Array.isArray(rawPlans)) return data;
  return {
    ...data,
    plans: rawPlans.map((plan) => {
      const p = plan as Record<string, unknown>;
      const transport = Array.isArray(p.transport) ? (p.transport as Array<Record<string, unknown>>) : [];
      return { ...p, transport: transport.filter((item) => typeof item.link === 'string' && isAllowedLink(item.link)) };
    })
  };
};

const normalizeResponse = (data: Record<string, unknown>): Record<string, unknown> => {
  if (!data.plans && Array.isArray(data.itinerary)) {
    const { itinerary, transport, attractions, hotels, ...rest } = data as Record<string, unknown> & {
      itinerary: unknown; transport: unknown; attractions: unknown; hotels: unknown;
    };
    return { ...rest, plans: [{ label: typeof data.summary === 'string' ? data.summary : 'Plan Option', itinerary, transport, attractions, hotels }] };
  }
  return data;
};

const looksLikeJsonPayload = (text: string): boolean => {
  const value = (text || '').trim();
  if (!value) return false;
  if (/^```(?:json)?/i.test(value)) return true;
  if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) return true;
  return /"feasible"\s*:|"plans"\s*:|"itinerary"\s*:|"summary"\s*:/i.test(value);
};

const simplifyLongTripItinerary = (
  itinerary: Array<Record<string, unknown>>,
  totalDays: number
): Array<Record<string, unknown>> => {
  if (!itinerary.length || totalDays < LONG_TRIP_SIMPLIFY_FROM_DAYS) return itinerary;

  const maxSegments = totalDays >= 30 ? 8 : totalDays >= 21 ? 7 : 6;
  const segmentSize = Math.max(1, Math.ceil(totalDays / maxSegments));
  const compact: Array<Record<string, unknown>> = [];

  for (let startDay = 1; startDay <= totalDays; startDay += segmentSize) {
    const endDay = Math.min(totalDays, startDay + segmentSize - 1);
    const source =
      itinerary.find((item) => {
        const dayValue = typeof item.day === 'number' ? item.day : Number(item.day);
        return !Number.isNaN(dayValue) && dayValue >= startDay && dayValue <= endDay;
      }) ?? itinerary[Math.min(itinerary.length - 1, startDay - 1)];

    const rawPlan = Array.isArray(source?.plan) ? source.plan : [];
    const planLines = rawPlan.filter((line): line is string => typeof line === 'string' && line.trim().length > 0);
    const rangeLabel = startDay === endDay ? `Day ${startDay}` : `Days ${startDay}-${endDay}`;

    compact.push({
      day: startDay,
      plan: [
        planLines[0]
          ? `${rangeLabel}: ${planLines[0]}`
          : `${rangeLabel}: Cover key attractions and keep pace flexible.`,
        ...planLines.slice(1, 2)
      ]
    });
  }

  return compact;
};

const simplifyLongTripResponse = (
  data: Record<string, unknown>,
  known: KnownTripContext
): Record<string, unknown> => {
  const totalDays = known.days;
  if (!totalDays || totalDays < LONG_TRIP_SIMPLIFY_FROM_DAYS) return data;

  const rawPlans = (data as { plans?: unknown }).plans;
  if (!Array.isArray(rawPlans)) return data;

  const plans = rawPlans.map((plan) => {
    const planData = plan as Record<string, unknown>;
    const rawItinerary = Array.isArray(planData.itinerary)
      ? (planData.itinerary as Array<Record<string, unknown>>)
      : [];

    if (rawItinerary.length <= 10) return planData;

    return {
      ...planData,
      itinerary: simplifyLongTripItinerary(rawItinerary, totalDays)
    };
  });

  const existingNotes = Array.isArray((data as { notes?: unknown }).notes)
    ? ((data as { notes?: unknown }).notes as unknown[]).filter((note): note is string => typeof note === 'string')
    : [];

  const hasLongTripNote = existingNotes.some((note) =>
    /grouped into phases|long trip/i.test(note)
  );

  return {
    ...data,
    plans,
    notes: hasLongTripNote
      ? existingNotes
      : [...existingNotes, 'Long trip itinerary is grouped into phases so it stays easy to follow.']
  };
};

// ── Fallback Plan ─────────────────────────────────────────────────────────────

const createFallbackPlan = (known: KnownTripContext): Record<string, unknown> => {
  const origin = known.origin || 'Origin';
  const destination = known.destination || 'Destination';
  const days = Math.max(known.days || 2, 2);
  const total = Math.max(known.budgetInr || 9000, 4000);
  const international = isInternationalTrip(origin, destination);
  const bookingLinks = generateBookingLinks(origin, destination, international)
    .filter((item) => item.type !== 'Hotel')
    .slice(0, 6)
    .map((item) => ({ type: item.type, provider: item.provider, link: item.url }));

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
  const lodgingEstimate = Math.round(total * 0.30);
  const foodEstimate = Math.round(total * 0.18);
  const localEstimate = Math.max(total - transportEstimate - lodgingEstimate - foodEstimate, 0);

  return {
    feasible: true,
    summary: `Here is a practical ${origin} to ${destination} plan with estimate ranges in INR.`,
    origin, destination,
    budget: { currency: 'INR', total_estimate: total, breakdown: { transport: transportEstimate, lodging: lodgingEstimate, food: foodEstimate, local_transport: localEstimate } },
    plans: [{ label: 'Balanced Plan', itinerary, transport: bookingLinks, attractions: ['Main city landmarks', 'Local market walk', 'Evening viewpoint'], hotels: [{ name: 'Well-rated central stay', area: destination, approx_price: 'INR 1800-3200 per night' }] }],
    alternatives: ['Increase budget by 15-20% for weekend peak dates.', 'Reduce one hotel night for tighter budgets.'],
    notes: ['Costs are estimates and may vary by season and booking time.']
  };
};

// ── Groq API ──────────────────────────────────────────────────────────────────

const requestGroqCompletion = async (messages: GroqMessage[]): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.3, max_tokens: 1400, messages })
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`Groq API request failed (${response.status}). ${responseText}`);
  try {
    const payload = JSON.parse(responseText) as { choices?: Array<{ message?: { content?: string } }> };
    return payload?.choices?.[0]?.message?.content?.trim() || '';
  } catch {
    return responseText;
  }
};

const attemptJsonRepair = async (
  known: KnownTripContext,
  history: GroqMessage[],
  systemPrompt: string,
  originalMessage: string
): Promise<[Record<string, unknown> | null, string]> => {
  const repairPrompt = [
    'Return ONLY valid JSON. No markdown. No explanations. No emojis.',
    `Origin: ${known.origin}`,
    `Destination: ${known.destination}`,
    known.budgetInr ? `Budget INR: ${known.budgetInr}` : '',
    known.travelers ? `Travelers: ${known.travelers}` : '',
    known.days ? `Days: ${known.days}` : '',
    `Latest user message: ${sanitizeUserInput(originalMessage)}`,
    'Output must include: feasible, summary, origin, destination, budget, plans, alternatives, notes.',
    'JSON only.'
  ].filter(Boolean).join('\n');

  const retryContent = await requestGroqCompletion([
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: repairPrompt }
  ]);
  const [parsed, err] = extractJson(retryContent);
  if (err) console.warn('[WanderMate] JSON repair failed:', err.message);
  return [parsed, retryContent];
};

// ── Main Export ───────────────────────────────────────────────────────────────

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatApiResponse> => {
  if (!GROQ_API_KEY) throw new Error('Missing EXPO_PUBLIC_GROQ_API_KEY.');

  const safeMessage = sanitizeUserInput(payload.message || '');

  // Small talk short-circuit
  const smallTalkIntent = detectGeneralTalkIntent(safeMessage);
  if (smallTalkIntent) {
    const reply = generalTalkReply(smallTalkIntent);
    return { reply, data: undefined, raw: reply };
  }

  const history = (Array.isArray(payload.history) ? payload.history : []).slice(-20) as GroqMessage[];

  // What did the bot last ask? Used to resolve bare-number replies.
  const lastAskedField = getLastAskedField(history);

  // Parse all known context with bare-number resolution
  const known = parseKnownContext({ ...payload, message: safeMessage }, lastAskedField);

  // Which fields has the bot already asked about?
  const askedFields = deriveAskedFields(history);

  const isInternational =
    known.origin && known.destination
      ? isInternationalTrip(known.origin, known.destination)
      : false;

  // Hard feasibility check BEFORE calling the LLM
  // Catches impossible inputs (900 days, 10 INR) immediately
  const feasibility = checkFeasibility(known, isInternational);
  if (feasibility.ok === false) {
    const reply = feasibility.reply;
    return { reply, data: undefined, raw: reply };
  }

  const systemPrompt = buildSystemPrompt({ isInternational, known, askedFields });
  const explicitPlanRequest = hasExplicitPlanRequest(safeMessage);

  let rawContent = await requestGroqCompletion([
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: safeMessage }
  ]);

  let [parsed, parseError] = extractJson(rawContent);
  if (parseError) console.info('[WanderMate] First parse attempt:', parseError.message);

  const shouldForcePlan = Boolean(
    explicitPlanRequest ||
    (known.origin && known.destination && known.days && known.travelers && known.budgetInr)
  );

  if (!parsed && shouldForcePlan) {
    const [repairedPlan, repairedContent] = await attemptJsonRepair(known, history, systemPrompt, safeMessage);
    if (repairedPlan) {
      parsed = repairedPlan;
      rawContent = repairedContent;
    } else if (known.days && known.budgetInr) {
      parsed = createFallbackPlan(known);
      rawContent = '';
    }
  }

  if (parsed) {
    parsed = normalizeResponse(parsed);
    parsed = sanitizeTransportLinks(parsed);
    parsed = simplifyLongTripResponse(parsed, known);
  } else if (looksLikeJsonPayload(rawContent)) {
    if (known.origin && known.destination && known.days && known.budgetInr) {
      parsed = simplifyLongTripResponse(createFallbackPlan(known), known);
      rawContent = '';
    } else {
      rawContent =
        'I can help with that trip. Please share origin, destination, number of days, travelers, and budget in INR so I can generate a clear plan.';
    }
  }

  const toCleanText = (text: string): string => {
    const compactText = text.replace(/\s+/g, ' ').trim();
    if (looksLikeJsonPayload(compactText)) {
      return 'I prepared your trip details. Please share any missing fields, and I will present it in a clean readable format.';
    }
    const normalized = stripEmojis(compactText);
    return normalized || 'I am here to help with your travel plans.';
  };

  const reply = parsed
    ? (typeof parsed.summary === 'string' && parsed.summary.trim()
      ? stripEmojis(parsed.summary)
      : 'Here are your travel plan options.')
    : toCleanText(rawContent);

  return {
    reply,
    data: parsed ? (parsed as unknown as import('./chatTypes').ChatPlanResponse) : undefined,
    raw: rawContent
  };
};
