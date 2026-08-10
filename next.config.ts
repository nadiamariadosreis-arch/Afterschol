import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1mb — too small for the PDF/illustration uploads in
      // the admin area (livrinhos, atividades, capas de trilha).
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
