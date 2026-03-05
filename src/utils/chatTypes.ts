export type ChatRole = 'user' | 'assistant';

export type ChatBudget = {
  currency?: string;
  total_estimate?: number;
  breakdown?: {
    transport?: number;
    lodging?: number;
    food?: number;
    local_transport?: number;
  };
};

export type ChatTransportOption = {
  type: string;
  provider: string;
  link: string;
};

export type ChatHotelOption = {
  name: string;
  area?: string;
  approx_price?: string;
};

export type ChatItineraryDay = {
  day: number;
  plan: string[];
};

export type ChatPlanOption = {
  label: string;
  itinerary?: ChatItineraryDay[];
  transport?: ChatTransportOption[];
  attractions?: string[];
  hotels?: ChatHotelOption[];
};

export type ChatPlanResponse = {
  feasible: boolean;
  summary?: string;
  origin?: string;
  destination?: string;
  budget?: ChatBudget;
  plans?: ChatPlanOption[];
  alternatives?: string[];
  notes?: string[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  data?: ChatPlanResponse;
  createdAt: number;
};

export type TripRequest = {
  origin?: string;
  destination?: string;
  dates?: string;
  budget?: {
    amount?: number;
    currency?: string;
  };
  travelers?: number;
  style?: string;
  preferences?: string;
};

export type ChatRequest = {
  message: string;
  history?: Array<{ role: ChatRole; content: string }>;
  tripRequest?: TripRequest;
};

export type ChatApiResponse = {
  reply: string;
  data?: ChatPlanResponse;
  raw?: string;
};
