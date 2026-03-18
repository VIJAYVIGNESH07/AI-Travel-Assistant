import AsyncStorage from '@react-native-async-storage/async-storage';

const STORIES_KEY = 'stories_db_json';
const POSTS_KEY = 'posts_db_json';
const POST_INTERACTIONS_KEY = 'post_interactions_json';
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
  shares?: number;
  createdAt: number;
};

export type StoredComment = {
  id: string;
  text: string;
  user: string;
  createdAt: number;
};

export type PostInteractionState = {
  likes: number;
  comments: number;
  shares: number;
  likedByMe: boolean;
  commentsList: StoredComment[];
};

type PostInteractionMap = Record<string, PostInteractionState>;

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

const safeParseObject = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as T;
    }
  } catch {
    return fallback;
  }

  return fallback;
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

export const deleteStoredPost = async (postId: string): Promise<void> => {
  const existing = await getStoredPosts();
  const next = existing.filter((post) => post.id !== postId);
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(next));
};

export const getPostInteractionMap = async (): Promise<PostInteractionMap> => {
  const raw = await AsyncStorage.getItem(POST_INTERACTIONS_KEY);
  return safeParseObject<PostInteractionMap>(raw, {});
};

export const getPostInteraction = async (
  postId: string,
  defaults: { likes: number; comments: number; shares?: number }
): Promise<PostInteractionState> => {
  const map = await getPostInteractionMap();
  const state = map[postId];
  if (state) {
    return {
      likes: typeof state.likes === 'number' ? state.likes : defaults.likes,
      comments: typeof state.comments === 'number' ? state.comments : defaults.comments,
      shares: typeof state.shares === 'number' ? state.shares : defaults.shares || 0,
      likedByMe: Boolean(state.likedByMe),
      commentsList: Array.isArray(state.commentsList) ? state.commentsList : []
    };
  }

  return {
    likes: defaults.likes,
    comments: defaults.comments,
    shares: defaults.shares || 0,
    likedByMe: false,
    commentsList: []
  };
};

const savePostInteractionMap = async (map: PostInteractionMap): Promise<void> => {
  await AsyncStorage.setItem(POST_INTERACTIONS_KEY, JSON.stringify(map));
};

export const togglePostLike = async (
  postId: string,
  defaults: { likes: number; comments: number; shares?: number }
): Promise<PostInteractionState> => {
  const map = await getPostInteractionMap();
  const current = await getPostInteraction(postId, defaults);
  const likedByMe = !current.likedByMe;
  const likes = likedByMe ? current.likes + 1 : Math.max(0, current.likes - 1);

  const next: PostInteractionState = {
    ...current,
    likes,
    likedByMe
  };
  map[postId] = next;
  await savePostInteractionMap(map);
  return next;
};

export const addPostComment = async (
  postId: string,
  text: string,
  user: string,
  defaults: { likes: number; comments: number; shares?: number }
): Promise<PostInteractionState> => {
  const map = await getPostInteractionMap();
  const current = await getPostInteraction(postId, defaults);
  const newComment: StoredComment = {
    id: `comment-${Date.now()}`,
    text,
    user,
    createdAt: Date.now()
  };

  const next: PostInteractionState = {
    ...current,
    comments: current.comments + 1,
    commentsList: [...current.commentsList, newComment]
  };

  map[postId] = next;
  await savePostInteractionMap(map);
  return next;
};

export const incrementPostShare = async (
  postId: string,
  defaults: { likes: number; comments: number; shares?: number }
): Promise<PostInteractionState> => {
  const map = await getPostInteractionMap();
  const current = await getPostInteraction(postId, defaults);
  const next: PostInteractionState = {
    ...current,
    shares: current.shares + 1
  };
  map[postId] = next;
  await savePostInteractionMap(map);
  return next;
};

export const toImageDataUri = (base64: string) => `data:image/jpeg;base64,${base64}`;
