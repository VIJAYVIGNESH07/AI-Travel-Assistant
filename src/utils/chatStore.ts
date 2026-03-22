import { ChatMessage, ChatPlanResponse } from './chatTypes';

type ChatListener = (messages: ChatMessage[]) => void;

const listeners = new Set<ChatListener>();

const createWelcomeMessage = (): ChatMessage => ({
  id: `welcome-${Date.now()}`,
  role: 'assistant',
  text: 'Hi! I am WanderMate, your AI travel assistant. Tell me where you want to go and I will plan your trip. You can also ask me anything about travel in India or around the world.',
  createdAt: Date.now()
});

let messages: ChatMessage[] = [createWelcomeMessage()];

const notify = () => {
  const snapshot = [...messages];
  listeners.forEach((listener) => listener(snapshot));
};

const buildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const getChatMessages = () => [...messages];

export const addChatMessage = (message: ChatMessage) => {
  messages = [...messages, message];
  notify();
  return message;
};

export const addUserMessage = (text: string) =>
  addChatMessage({
    id: buildId('user'),
    role: 'user',
    text,
    createdAt: Date.now()
  });

export const addAssistantMessage = (text: string, data?: ChatPlanResponse) =>
  addChatMessage({
    id: buildId('assistant'),
    role: 'assistant',
    text,
    data,
    createdAt: Date.now()
  });

export const resetChatMessages = () => {
  messages = [createWelcomeMessage()];
  notify();
};

export const subscribeToChat = (listener: ChatListener) => {
  listeners.add(listener);
  listener([...messages]);
  return () => {
    listeners.delete(listener);
  };
};
