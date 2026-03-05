import { ChatMessage, ChatPlanResponse } from './chatTypes';

type ChatListener = (messages: ChatMessage[]) => void;

const listeners = new Set<ChatListener>();

let messages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi, I am WanderMate. Where would you like to go next?',
    createdAt: Date.now()
  }
];

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

export const subscribeToChat = (listener: ChatListener) => {
  listeners.add(listener);
  listener([...messages]);
  return () => {
    listeners.delete(listener);
  };
};
