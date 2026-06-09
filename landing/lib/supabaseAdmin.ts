import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/serverEnv';

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = serverEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = serverEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}