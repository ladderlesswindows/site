import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readPublicSupabaseConfig } from '@/lib/supabaseEnv';

const config = readPublicSupabaseConfig();

let supabase: SupabaseClient | null = null;

if (config.configured) {
  supabase = createClient(config.url, config.anonKey);
} else if (typeof window === 'undefined') {
  console.warn(
    '⚠️ Supabase env vars are missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).\n' +
      'Browser clients can load config from /api/supabase-config at runtime.\n' +
      'See SUPABASE_SETUP.md for instructions.'
  );
}

export { supabase };
