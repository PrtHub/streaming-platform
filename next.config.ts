import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "mcsj1khzf5.ufs.sh",
      },
    ],
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://seemingly-top-stork.ngrok-free.app",
  ],
};

export default nextConfig;
