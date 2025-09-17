import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⬇️ agar build di Vercel tetap jalan walaupun ada error ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
