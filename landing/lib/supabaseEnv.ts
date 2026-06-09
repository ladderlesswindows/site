import { DEFAULT_PROVIDER_ID } from '@/lib/bookingConstants';

export type PublicSupabaseConfig = {
  configured: boolean;
  url: string;
  anonKey: string;
  providerId: string;
};

export function readPublicSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env
): PublicSupabaseConfig {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const providerId = env.NEXT_PUBLIC_PROVIDER_ID?.trim() || DEFAULT_PROVIDER_ID;

  return {
    configured: Boolean(url && anonKey && url.startsWith('http')),
    url,
    anonKey,
    providerId,
  };
}