import fs from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';

let envLoaded = false;

function resolveProjectRoots(): { landingRoot: string; repoRoot: string } {
  const cwd = path.resolve(process.cwd());

  const landingFromCwd = path.join(cwd, 'landing');
  if (fs.existsSync(path.join(landingFromCwd, 'package.json'))) {
    return { landingRoot: landingFromCwd, repoRoot: cwd };
  }

  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    return { landingRoot: cwd, repoRoot: path.resolve(cwd, '..') };
  }

  return { landingRoot: cwd, repoRoot: path.resolve(cwd, '..') };
}

/** Load repo-root and landing `.env*` into process.env (local + build). No-op on Vercel runtime. */
export function ensureProjectEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;

  const { landingRoot, repoRoot } = resolveProjectRoots();
  loadEnvConfig(landingRoot);
  loadEnvConfig(repoRoot);
}

/** Server-only env — process.env first, then files loaded via ensureProjectEnvLoaded(). */
export function serverEnv(key: string): string {
  ensureProjectEnvLoaded();
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
}