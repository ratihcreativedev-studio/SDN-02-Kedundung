import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [new URL('/storage/v1/object/public/sipanda-images/**', process.env.NEXT_PUBLIC_SUPABASE_URL)]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
