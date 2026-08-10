import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb — too small for the PDF/cover uploads in the admin area.
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
