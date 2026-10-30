import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/ for Firebase Hosting.
  output: "export",
  experimental: {
    agentFeedback: true,
  },
  // cacheComponents / partialPrefetching are off: PPR cannot run in export mode.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
