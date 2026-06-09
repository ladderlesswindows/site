import { readPublicSupabaseConfig } from '@/lib/supabaseEnv';

export async function GET() {
  const config = readPublicSupabaseConfig();

  return Response.json({
    configured: config.configured,
    url: config.url,
    anonKey: config.anonKey,
    providerId: config.providerId,
  });
}