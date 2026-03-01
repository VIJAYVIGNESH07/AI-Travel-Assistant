import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../redux/slices/authSlice';

export type StoredUser = {
  name: string;
  email: string;
  password: string;
  location: string;
  avatar: string;
};

type UserDatabase = Record<string, StoredUser>;

const USERS_DB_KEY = 'users_db_json';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const safeParse = (value: string | null): UserDatabase => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as UserDatabase;
    }
  } catch {
    return {};
  }

  return {};
};

export const getUsersDatabase = async (): Promise<UserDatabase> => {
  const raw = await AsyncStorage.getItem(USERS_DB_KEY);
  return safeParse(raw);
};

export const getUserByEmail = async (email: string): Promise<StoredUser | null> => {
  const db = await getUsersDatabase();
  const key = normalizeEmail(email);
  return db[key] || null;
};

export const saveUser = async (user: StoredUser): Promise<void> => {
  const db = await getUsersDatabase();
  const key = normalizeEmail(user.email);
  db[key] = { ...user, email: key };
  await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
};

const buildHandle = (name: string) => {
  const base = name.trim().toLowerCase().replace(/\s+/g, '');
  return `@${base || 'traveler'}`;
};

export const toUserProfile = (user: StoredUser): UserProfile => {
  return {
    name: user.name,
    handle: buildHandle(user.name),
    location: user.location,
    avatar: user.avatar
  };
};

