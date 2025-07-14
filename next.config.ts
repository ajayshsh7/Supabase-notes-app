import type { NextConfig } from "next";

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: false, 
      },
    ]
  },
}

export default nextConfig;
