import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Monorepo layout: secrets live in repo-root .env.local, app runs from landing/
const repoRoot = path.resolve(__dirname, "..");
const { combinedEnv } = loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  // Ensure NEXT_PUBLIC_* reach client bundles (not only next.config evaluation)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: combinedEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_PROVIDER_ID: combinedEnv.NEXT_PUBLIC_PROVIDER_ID ?? "",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;