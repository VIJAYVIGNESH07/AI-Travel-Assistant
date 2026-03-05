# Groq Chatbot Research + Development Plan

Date: 2026-03-05

## 1) Current State (Code Reality)

- Chat is static. `ChatScreen.tsx` renders `chatMessages` and `chatSuggestions` from `src/data/mock.ts`, and the input only clears local state.
- Trip Planner is static. `TripPlannerScreen.tsx` only toggles a "ready" message and does not create or send an itinerary.

This means the chatbot has no real planning logic, no budget checks, and no live recommendations.

## 2) Product Goals (From Request)

1. Plans must be realistic and possible. If a request is impossible (ex: "America trip for 200 rupees"), the chatbot must refuse the plan and provide feasible alternatives.
2. Provide transport recommendations and direct users to the transport provider website.
3. Provide place/tourist attraction suggestions.
4. Provide hotel suggestions nearby (if possible).
5. Plans should not be only "low cost" by default. The assistant must adapt to the user's budget and style, and when feasible, offer multiple distinct plan options.

## 3) Groq API Research Summary

Groq provides an OpenAI-compatible API. The key integration points for this app:

- Base URL for OpenAI-compatible clients: `https://api.groq.com/openai/v1`
- Chat Completions endpoint: `POST /chat/completions`
- Authorization: `Authorization: Bearer <GROQ_API_KEY>`
- Official Node/TypeScript SDK: `groq-sdk` (server-side)
- Security guidance: API keys must never be exposed in client code; use environment variables or secret managers.

Sources:
- OpenAI compatibility: https://console.groq.com/docs/openai
- API reference (chat completions + auth): https://console.groq.com/docs/api-reference
- TypeScript SDK: https://github.com/groq/groq-typescript
- Security onboarding: https://console.groq.com/docs/production-readiness/security-onboarding

## 4) Architecture Plan (Safe + Production-Ready)

### 4.1 High-Level Flow

1. App sends user message + context to backend (Edge Function).
2. Edge Function calls Groq API with system + user prompts.
3. Backend returns structured response to app.
4. App renders itinerary, transport, attractions, and hotels.

### 4.2 Why a Backend Proxy Is Required

The Groq API key must not live in the React Native bundle. We should use a server-side function (Supabase Edge Functions already exist in this project) to keep secrets safe and allow rate limiting, caching, and audit logging.

### 4.3 Suggested Backend Location

- Supabase Edge Function (preferred, already in repo)
- Alternative: a lightweight Node server (if needed later)

## 5) Response Structure (Prevent "Impossible Plans")

To stop unrealistic plans, the model needs strict instructions and a response schema.

### 5.1 Required Input Fields

- Origin city/country
- Destination (or "open to suggestions")
- Dates or trip length
- Budget + currency
- Number of travelers
- Travel style (budget/mid/luxury)

If any are missing, the bot should ask clarifying questions before generating a full plan.

### 5.2 Feasibility Gate (Must Run Before Planning)

1. Estimate minimum transport cost using known ranges or cached estimates.
2. Estimate minimum lodging cost (even hostel/low-cost).
3. Estimate basic daily food + local transport.
4. If total minimum cost > budget:
   - Return "Not feasible within this budget"
   - Offer 2-3 alternatives:
     - Cheaper destination closer to origin
     - Reduced trip length
     - Off-season dates
     - Local weekend/day-trip options
5. If feasible:
   - Produce 2-3 distinct plan variants (different themes, pacing, or neighborhoods), all within the same budget and dates.
   - Do not force "low cost" framing when the user's budget or style is mid-range or premium.

### 5.3 Output Schema (Example)

Return JSON so the UI can render sections clearly:

```
{
  "feasible": true,
  "summary": "3-day trip to Jaipur",
  "budget": {
    "currency": "INR",
    "total_estimate": 4800,
    "breakdown": {
      "transport": 1800,
      "lodging": 1800,
      "food": 900,
      "local_transport": 300
    }
  },
  "plans": [
    {
      "label": "Heritage + Food",
      "itinerary": [
        { "day": 1, "plan": ["Hawa Mahal", "City Palace", "Local street food"] }
      ],
      "transport": [
        { "type": "Train", "provider": "IRCTC", "link": "https://www.irctc.co.in/" }
      ],
      "attractions": ["Hawa Mahal", "Amber Fort", "Jantar Mantar"],
      "hotels": [
        { "name": "Budget Hostel Example", "area": "MI Road", "approx_price": "INR 700/night" }
      ]
    },
    {
      "label": "Slow + Scenic",
      "itinerary": [
        { "day": 1, "plan": ["Amber Fort", "Jal Mahal", "Sunset viewpoint"] }
      ],
      "transport": [
        { "type": "Bus", "provider": "RedBus", "link": "https://www.redbus.in/" }
      ],
      "attractions": ["Amber Fort", "Jal Mahal", "Nahargarh Fort"],
      "hotels": [
        { "name": "Guesthouse Example", "area": "Bani Park", "approx_price": "INR 800/night" }
      ]
    }
  ],
  "notes": ["Prices are estimates. Verify before booking."]
}
```

## 6) Transport Link Strategy

Maintain a small config map of transport providers by country/region:

- India: IRCTC (train), RedBus (bus), Indigo/Air India (flight)
- Global: Rome2Rio (multi-modal), Skyscanner/Google Flights (flight meta)
- Local rides: Uber/Ola (city transport)

The assistant should only output links from this approved list to avoid hallucinated websites.

## 7) Hotel & Attraction Strategy

To keep responses realistic:

1. MVP: Provide category-based suggestions (hostels/guesthouses/budget hotels) without claiming real-time availability.
2. Phase 2: Integrate a real provider API (Booking/Agoda/Amadeus/Google Places) and pass structured hotel data into the prompt.

The LLM should be instructed to mark all prices as estimates unless a live API provides them.

## 8) Implementation Plan (Concrete Tasks)

### Phase 1: Foundation (MVP)

1. Add Edge Function: `supabase/functions/chat-completions`
2. Add server-side Groq client (using `groq-sdk`).
3. Add app client: `src/utils/chatApi.ts`
4. Update `ChatScreen.tsx` to:
   - Maintain message history in state
   - Call `chatApi.sendMessage(...)`
   - Append assistant response
   - Render multiple plan options with selectable cards/tabs
5. Update `TripPlannerScreen.tsx` to send a structured trip request to chat instead of a static message.
6. Add a small `transportProviders.ts` config for safe link output.

### Phase 2: Feasibility Guardrails

1. Add a budget estimation helper in the backend.
2. Enforce "not feasible" responses when budget is too low.
3. Add clarifying questions when key details are missing.

### Phase 3: Data Accuracy

1. Integrate travel data APIs (transport + hotels).
2. Cache results to control cost and latency.
3. Add region-specific recommendations and safety notes.

## 9) Prompting Strategy (System + Tooling)

Key rules in system prompt:

- Never output a plan that is infeasible for the budget.
- If budget is too low, explicitly say so and propose feasible alternatives.
- If budget is feasible, generate multiple distinct plan variants (2-3) within the same budget and dates.
- Adapt the framing to the user's budget and style; do not default to "low cost" unless required by budget.
- Always include transport options with approved provider links.
- Always include at least 3 attractions.
- Include hotel suggestions only if budget supports overnight stay.
- Clearly mark price estimates vs confirmed prices.

## 10) Testing Checklist

- Budget too low -> returns "not feasible" + alternatives
- Missing inputs -> asks clarifying questions
- Feasible requests -> itinerary + transport + attractions + hotels
- Transport links only from allowlist
- No API keys in client bundle

## 11) Open Questions

1. Should we prioritize India-only transport links first, or global providers?
2. Do you want a "local day-trip" fallback when budget is too low?
3. Which travel data APIs do you want to pay for (if any)?
