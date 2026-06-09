import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Monorepo layout: secrets live in repo-root .env.local, app runs from landing/
const repoRoot = path.resolve(__dirname, "..");
const landingRoot = path.resolve(__dirname);
const { combinedEnv: repoEnv } = loadEnvConfig(repoRoot);
const { combinedEnv: landingEnv } = loadEnvConfig(landingRoot);
const combinedEnv = { ...landingEnv, ...repoEnv };

function publicEnv(key: keyof typeof combinedEnv): string {
  // Vercel injects process.env at build time; local dev uses repo-root .env.local via loadEnvConfig
  const value = process.env[key] ?? combinedEnv[key];
  return typeof value === "string" ? value : "";
}

const nextConfig: NextConfig = {
  // Ensure NEXT_PUBLIC_* reach client bundles (not only next.config evaluation)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: publicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    NEXT_PUBLIC_PROVIDER_ID: publicEnv("NEXT_PUBLIC_PROVIDER_ID"),
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;