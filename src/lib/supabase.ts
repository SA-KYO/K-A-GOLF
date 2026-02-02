import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface GolfAttendee {
  id: string;
  name: string;
  phone?: string | null;
  attendance_status: 'attending' | 'not_attending';
  comment: string | null;
  created_at: string;
}

export interface GolfMediaUpload {
  id: string;
  uploader_name: string | null;
  comment: string | null;
  file_path: string;
  original_name: string;
  file_type: string | null;
  file_size: number | null;
  cloudinary_public_id: string | null;
  cloudinary_url: string | null;
  cloudinary_delete_token: string | null;
  cloudinary_resource_type: string | null;
  created_at: string;
}
