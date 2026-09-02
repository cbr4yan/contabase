import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    // Receipt photos are compressed client-side (~300 KB); allow headroom.
    serverActions: { bodySizeLimit: "6mb" },
  },
}

export default nextConfig
