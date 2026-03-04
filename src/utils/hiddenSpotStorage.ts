import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured } from '../config/supabase';
import { supabase } from './supabaseClient';

const HIDDEN_SPOT_SUBMISSIONS_KEY = 'hidden_spot_submissions_json';
const HIDDEN_SPOT_TABLE = 'hidden_spot_requests';

export type HiddenSpotSubmissionStatus = 'pending' | 'approved' | 'rejected';

export type HiddenSpotSubmission = {
  id: string;
  submittedBy: string;
  submittedByHandle: string;
  submittedAt: number;
  verify: boolean;
  status: HiddenSpotSubmissionStatus;
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  accessibility: string;
  bestTime: string;
  imageBase64List: string[];
  adminDecisionAt: number | null;
  adminNotes: string;
};

export type HiddenSpotProfileSpot = {
  id: string;
  name: string;
  locationLabel: string;
  category: string;
  description: string;
  image: string;
  submittedAt: number;
};

type ExplorePlace = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  latitude: number;
  longitude: number;
  category: string;
  vrLink: string;
  description: string;
  image: string;
};

type HiddenSpotRow = {
  id: string;
  submitted_by_name: string;
  submitted_by_handle: string;
  submitted_at: string;
  verify: boolean;
  status: HiddenSpotSubmissionStatus;
  name: string;
  location_label: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  accessibility: string;
  best_time: string;
  image_base64_list: string[];
  admin_decision_at: string | null;
  admin_notes: string;
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

const toImageDataUri = (base64: string) => `data:image/jpeg;base64,${base64}`;

const mapSubmissionToRow = (submission: HiddenSpotSubmission): HiddenSpotRow => ({
  id: submission.id,
  submitted_by_name: submission.submittedBy,
  submitted_by_handle: submission.submittedByHandle,
  submitted_at: new Date(submission.submittedAt).toISOString(),
  verify: submission.verify,
  status: submission.status,
  name: submission.name,
  location_label: submission.locationLabel,
  latitude: submission.latitude,
  longitude: submission.longitude,
  category: submission.category,
  description: submission.description,
  accessibility: submission.accessibility,
  best_time: submission.bestTime,
  image_base64_list: submission.imageBase64List,
  admin_decision_at: submission.adminDecisionAt ? new Date(submission.adminDecisionAt).toISOString() : null,
  admin_notes: submission.adminNotes
});

const mapRowToSubmission = (row: HiddenSpotRow): HiddenSpotSubmission => ({
  id: row.id,
  submittedBy: row.submitted_by_name,
  submittedByHandle: row.submitted_by_handle,
  submittedAt: new Date(row.submitted_at).getTime(),
  verify: row.verify,
  status: row.status,
  name: row.name,
  locationLabel: row.location_label,
  latitude: row.latitude,
  longitude: row.longitude,
  category: row.category,
  description: row.description,
  accessibility: row.accessibility,
  bestTime: row.best_time,
  imageBase64List: row.image_base64_list || [],
  adminDecisionAt: row.admin_decision_at ? new Date(row.admin_decision_at).getTime() : null,
  adminNotes: row.admin_notes || ''
});

export const getHiddenSpotSubmissions = async (): Promise<HiddenSpotSubmission[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from(HIDDEN_SPOT_TABLE)
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data as HiddenSpotRow[]).map(mapRowToSubmission);
  }

  const raw = await AsyncStorage.getItem(HIDDEN_SPOT_SUBMISSIONS_KEY);
  const data = safeParseArray<Partial<HiddenSpotSubmission>>(raw).map((item) => {
    const status = item.status || 'pending';
    const verify = typeof item.verify === 'boolean' ? item.verify : status === 'approved';

    return {
      id: item.id || `hs-${Date.now()}`,
      submittedBy: item.submittedBy || 'Traveler',
      submittedByHandle: item.submittedByHandle || '@traveler',
      submittedAt: item.submittedAt || Date.now(),
      verify,
      status,
      name: item.name || 'Untitled Spot',
      locationLabel: item.locationLabel || 'Unknown location',
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      category: item.category || 'Hidden Spot',
      description: item.description || '',
      accessibility: item.accessibility || '',
      bestTime: item.bestTime || '',
      imageBase64List: item.imageBase64List || [],
      adminDecisionAt: item.adminDecisionAt || null,
      adminNotes: item.adminNotes || ''
    } satisfies HiddenSpotSubmission;
  });
  return data.sort((a, b) => b.submittedAt - a.submittedAt);
};

export const addHiddenSpotSubmission = async (submission: HiddenSpotSubmission): Promise<void> => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from(HIDDEN_SPOT_TABLE).insert(mapSubmissionToRow(submission));
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const current = await getHiddenSpotSubmissions();
  const next = [submission, ...current];
  await AsyncStorage.setItem(HIDDEN_SPOT_SUBMISSIONS_KEY, JSON.stringify(next));
};

export const updateHiddenSpotSubmissionStatus = async (
  id: string,
  status: HiddenSpotSubmissionStatus,
  adminNotes = ''
): Promise<void> => {
  if (isSupabaseConfigured) {
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from(HIDDEN_SPOT_TABLE)
      .update({
        status,
        verify: status === 'approved',
        admin_notes: adminNotes,
        admin_decision_at: nowIso
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const current = await getHiddenSpotSubmissions();
  const next = current.map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      verify: status === 'approved',
      status,
      adminNotes,
      adminDecisionAt: Date.now()
    };
  });

  await AsyncStorage.setItem(HIDDEN_SPOT_SUBMISSIONS_KEY, JSON.stringify(next));
};

export const getApprovedHiddenSpotPlaces = async (submittedByHandle?: string): Promise<ExplorePlace[]> => {
  if (isSupabaseConfigured) {
    let query = supabase
      .from(HIDDEN_SPOT_TABLE)
      .select('*')
      .eq('verify', true)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });

    if (submittedByHandle) {
      query = query.eq('submitted_by_handle', submittedByHandle);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const submissions = (data as HiddenSpotRow[]).map(mapRowToSubmission);

    return submissions.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.locationLabel,
      rating: 4.5,
      reviews: 0,
      latitude: item.latitude,
      longitude: item.longitude,
      category: item.category || 'Hidden Spot',
      vrLink: '',
      description: item.description,
      image: item.imageBase64List[0] ? toImageDataUri(item.imageBase64List[0]) : ''
    }));
  }

  const submissions = await getHiddenSpotSubmissions();

  return submissions
    .filter((item) => item.verify && item.status === 'approved')
    .filter((item) => {
      if (!submittedByHandle) {
        return true;
      }

      return item.submittedByHandle === submittedByHandle;
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      location: item.locationLabel,
      rating: 4.5,
      reviews: 0,
      latitude: item.latitude,
      longitude: item.longitude,
      category: item.category || 'Hidden Spot',
      vrLink: '',
      description: item.description,
      image: item.imageBase64List[0] ? toImageDataUri(item.imageBase64List[0]) : ''
    }));
};

export const getApprovedHiddenSpotsForProfile = async (
  submittedByHandle?: string
): Promise<HiddenSpotProfileSpot[]> => {
  if (isSupabaseConfigured) {
    let query = supabase
      .from(HIDDEN_SPOT_TABLE)
      .select('*')
      .eq('verify', true)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false });

    if (submittedByHandle) {
      query = query.eq('submitted_by_handle', submittedByHandle);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    const submissions = (data as HiddenSpotRow[]).map(mapRowToSubmission);

    return submissions.map((item) => ({
      id: item.id,
      name: item.name,
      locationLabel: item.locationLabel,
      category: item.category || 'Hidden Spot',
      description: item.description,
      image: item.imageBase64List[0] ? toImageDataUri(item.imageBase64List[0]) : '',
      submittedAt: item.submittedAt
    }));
  }

  const submissions = await getHiddenSpotSubmissions();

  return submissions
    .filter((item) => item.verify && item.status === 'approved')
    .filter((item) => {
      if (!submittedByHandle) {
        return true;
      }

      return item.submittedByHandle === submittedByHandle;
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      locationLabel: item.locationLabel,
      category: item.category || 'Hidden Spot',
      description: item.description,
      image: item.imageBase64List[0] ? toImageDataUri(item.imageBase64List[0]) : '',
      submittedAt: item.submittedAt
    }));
};

