import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Monorepo layout: secrets live in repo-root .env.local, app runs from landing/
loadEnvConfig(path.resolve(__dirname, ".."));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
