import type { NextConfig } from "next";

// Reload server environment to pick up new Prisma models (Certification, Facility)
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
