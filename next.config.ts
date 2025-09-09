import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'capp-imagescurie-dev-001.calmgrass-38ffeef2.eastus2.azurecontainerapps.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
