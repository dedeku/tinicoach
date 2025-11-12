import type { NextConfig } from "next";
// @ts-ignore - next-pwa doesn't have TypeScript definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Explicitly use webpack for next-pwa compatibility
  webpack: (config) => {
    return config;
  },
  // Vercel optimizations
  output: undefined, // Let Vercel handle output (default for Next.js)
  // Ensure agent-os/product files are included in build
  serverExternalPackages: [],
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Disable PWA in development, enable in production (Vercel)
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [],
  // Vercel-specific: ensure service worker is served correctly
  publicExcludes: ["!robots.txt", "!sitemap.xml"],
});

export default pwaConfig(nextConfig);

