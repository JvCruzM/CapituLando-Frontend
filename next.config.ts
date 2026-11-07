import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CAPITULANDO_E2E === "1" ? ".next-e2e" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
