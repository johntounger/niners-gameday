import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client. The app has no auth (open URL is the only
 * "security"), so a single anon client serves both server components
 * (for SSR fetching) and client components (for mutations + realtime).
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}
