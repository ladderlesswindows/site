'use client';

import { useEffect, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_PROVIDER_ID } from '@/lib/bookingConstants';

type SupabaseState = {
  supabase: SupabaseClient | null;
  providerId: string;
  ready: boolean;
};

let cachedClient: SupabaseClient | null | undefined;
let cachedProviderId: string | undefined;

function configFromBuildEnv(): { url: string; anonKey: string; providerId: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  const providerId = process.env.NEXT_PUBLIC_PROVIDER_ID?.trim() || DEFAULT_PROVIDER_ID;

  if (url && anonKey && url.startsWith('http')) {
    return { url, anonKey, providerId };
  }

  return null;
}

async function resolveSupabaseClient(): Promise<{
  client: SupabaseClient | null;
  providerId: string;
}> {
  if (cachedClient !== undefined) {
    return {
      client: cachedClient,
      providerId: cachedProviderId ?? DEFAULT_PROVIDER_ID,
    };
  }

  const buildConfig = configFromBuildEnv();
  if (buildConfig) {
    cachedClient = createClient(buildConfig.url, buildConfig.anonKey);
    cachedProviderId = buildConfig.providerId;
    return { client: cachedClient, providerId: buildConfig.providerId };
  }

  try {
    const res = await fetch('/api/supabase-config', { cache: 'no-store' });
    if (!res.ok) throw new Error(`supabase-config ${res.status}`);

    const data = (await res.json()) as {
      configured?: boolean;
      url?: string;
      anonKey?: string;
      providerId?: string;
    };

    if (data.configured && data.url && data.anonKey) {
      cachedClient = createClient(data.url, data.anonKey);
      cachedProviderId = data.providerId || DEFAULT_PROVIDER_ID;
      return { client: cachedClient, providerId: cachedProviderId };
    }
  } catch (error) {
    console.error('Failed to load Supabase config:', error);
  }

  cachedClient = null;
  cachedProviderId = DEFAULT_PROVIDER_ID;
  return { client: null, providerId: DEFAULT_PROVIDER_ID };
}

export function useSupabase(): SupabaseState {
  const [state, setState] = useState<SupabaseState>({
    supabase: null,
    providerId: DEFAULT_PROVIDER_ID,
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;

    resolveSupabaseClient().then(({ client, providerId }) => {
      if (!cancelled) {
        setState({ supabase: client, providerId, ready: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}