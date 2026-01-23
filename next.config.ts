import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: false,
  cacheStartUrl: false,        // Don't cache the start URL aggressively  
  dynamicStartUrl: true,       // Always fetch fresh start URL
  fallbacks: {
    document: "/mobile/login",
  },
  workboxOptions: {
    skipWaiting: true,         // Activate new SW immediately without waiting
    clientsClaim: true,        // Take control of all pages immediately
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA(nextConfig);
