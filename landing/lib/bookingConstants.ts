/** Canonical provider UUID — must match admin calendar and Supabase `providers` row. */
export const DEFAULT_PROVIDER_ID = 'cc79bb27-5b21-4c56-aaae-7da80d38fa9f';

export const PROVIDER_ID =
  process.env.NEXT_PUBLIC_PROVIDER_ID || DEFAULT_PROVIDER_ID;