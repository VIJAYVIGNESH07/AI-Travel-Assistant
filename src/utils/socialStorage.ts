import AsyncStorage from '@react-native-async-storage/async-storage';

const STORIES_KEY = 'stories_db_json';
const POSTS_KEY = 'posts_db_json';
const STORY_LIFETIME_MS = 10 * 60 * 1000;

export type StoredStory = {
  id: string;
  name: string;
  imageBase64: string;
  seen: boolean;
  isAdd: boolean;
  createdAt: number;
};

export type StoredPost = {
  id: string;
  user: string;
  handle: string;
  location: string;
  caption: string;
  imageBase64: string;
  likes: number;
  comments: number;
  createdAt: number;
};

const safeParseArray = <T>(value: string | null): T[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed as T[];
    }
  } catch {
    return [];
  }

  return [];
};

export const getStoredStories = async (): Promise<StoredStory[]> => {
  const raw = await AsyncStorage.getItem(STORIES_KEY);
  const stories = safeParseArray<StoredStory>(raw);
  const now = Date.now();
  const activeStories = stories.filter((story) => now - story.createdAt < STORY_LIFETIME_MS);

  if (activeStories.length !== stories.length) {
    await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(activeStories));
  }

  return activeStories.sort((a, b) => b.createdAt - a.createdAt);
};

export const addStoredStory = async (story: StoredStory): Promise<void> => {
  const existing = await getStoredStories();
  const next = [story, ...existing];
  await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(next));
};

export const getStoredPosts = async (): Promise<StoredPost[]> => {
  const raw = await AsyncStorage.getItem(POSTS_KEY);
  const posts = safeParseArray<StoredPost>(raw);
  return posts.sort((a, b) => b.createdAt - a.createdAt);
};

export const addStoredPost = async (post: StoredPost): Promise<void> => {
  const existing = await getStoredPosts();
  const next = [post, ...existing];
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(next));
};

export const updateStoredPostLikes = async (postId: string, likes: number): Promise<void> => {
  const existing = await getStoredPosts();
  const next = existing.map((post) => {
    if (post.id !== postId) {
      return post;
    }

    return {
      ...post,
      likes
    };
  });
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(next));
};

export const toImageDataUri = (base64: string) => `data:image/jpeg;base64,${base64}`;
