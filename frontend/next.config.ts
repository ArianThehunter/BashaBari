import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for catching potential issues
  reactStrictMode: true,

  // Output configuration for production
  output: "standalone",

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_NAME: "BashaBari",
    NEXT_PUBLIC_APP_LOCALE: "en-BD",
    NEXT_PUBLIC_APP_TIMEZONE: "Asia/Dhaka",
    NEXT_PUBLIC_CURRENCY: "BDT",
    NEXT_PUBLIC_CURRENCY_MINOR_UNIT: "100", // 1 BDT = 100 poisha
  },

  // Rewrites to proxy API requests to Laravel backend in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
