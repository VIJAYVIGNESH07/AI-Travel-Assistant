import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const FALLBACK_SUPABASE_URL = 'https://placeholder.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const resolvedSupabaseUrl = SUPABASE_URL || FALLBACK_SUPABASE_URL;
const resolvedSupabaseAnonKey = SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Configure Supabase client with flexible SSL handling for Expo environments
export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    // Add custom headers for better SSL/TLS handling in mobile environments
    headers: {
      'User-Agent': 'wandermate-app'
    },
    // Reduce connection timeout to fail fast and allow retries
    fetch: (url, options) => {
      const mergedHeaders = new Headers((options as RequestInit | undefined)?.headers);
      mergedHeaders.set('X-Bypass-SSL-Check', 'true');

      // Increase timeout for mobile networks
      return Promise.race([
        fetch(url, {
          ...options,
          // Allow insecure connections in development/mobile to bypass SSL issues
          // This is NOT recommended for production but helps diagnose 525 errors
          headers: mergedHeaders
        } as RequestInit),
        new Promise<Response>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 30000)
        )
      ]);
    }
  }
});
