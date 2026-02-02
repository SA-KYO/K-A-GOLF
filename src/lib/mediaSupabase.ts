import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const mediaSupabaseUrl = import.meta.env.VITE_SUPABASE_MEDIA_URL;
const mediaSupabaseAnonKey = import.meta.env.VITE_SUPABASE_MEDIA_ANON_KEY;

export const isMediaSupabaseConfigured = Boolean(mediaSupabaseUrl && mediaSupabaseAnonKey);

export const mediaSupabase: SupabaseClient | null = isMediaSupabaseConfigured
  ? createClient(mediaSupabaseUrl, mediaSupabaseAnonKey)
  : null;
