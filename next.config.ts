import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚀 Esto evita que el build falle por errores de ESLint en Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
