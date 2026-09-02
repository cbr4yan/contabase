import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Receipt photos are compressed client-side (~300 KB). Keep under Vercel's
    // ~4.5 MB serverless request-body limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
}

export default nextConfig
