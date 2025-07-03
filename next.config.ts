import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'token-icons.llamao.fi',
        port: '',
        pathname: '/icons/tokens/**',
      },
    ],
  },
};

export default nextConfig;
