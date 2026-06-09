import path from 'path';
import { loadEnvConfig } from '@next/env';

let cachedEnv: Record<string, string | undefined> | null = null;

/** Server-only env — reads Vercel/process env and repo-root `.env.local` (see next.config). */
function getCombinedEnv(): Record<string, string | undefined> {
  if (cachedEnv) return cachedEnv;

  const landingRoot = path.resolve(process.cwd());
  const repoRoot = path.resolve(landingRoot, '..');
  const { combinedEnv: landingEnv } = loadEnvConfig(landingRoot);
  const { combinedEnv: repoEnv } = loadEnvConfig(repoRoot);

  cachedEnv = { ...landingEnv, ...repoEnv };
  return cachedEnv;
}

export function serverEnv(key: string): string {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) return fromProcess;
  const value = getCombinedEnv()[key];
  return typeof value === 'string' ? value.trim() : '';
}