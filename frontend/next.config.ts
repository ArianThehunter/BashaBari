import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 *
 * `unsafe-inline` for scripts is required by the Next.js App Router bootstrap
 * (it inlines hydration payloads); `unsafe-eval` is only needed by the dev
 * overlay. Everything else is locked to same-origin, which is what stops an
 * injected tag from loading or exfiltrating to a third-party host.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // Do not advertise the framework version.
  poweredByHeader: false,

  images: {
    // Previously `hostname: "**"`, which turned the optimizer into an open
    // image proxy for any host on the internet.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "BashaBari",
    NEXT_PUBLIC_APP_LOCALE: "en-BD",
    NEXT_PUBLIC_APP_TIMEZONE: "Asia/Dhaka",
    NEXT_PUBLIC_CURRENCY: "BDT",
    NEXT_PUBLIC_CURRENCY_MINOR_UNIT: "100", // 1 BDT = 100 poisha
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/sanctum/:path*", destination: `${apiUrl}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;
