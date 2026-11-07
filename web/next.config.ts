import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Artwork comes straight from the source CDNs; next/image isn't used.
  images: { unoptimized: true },
  // Pin the root so a stray lockfile in a parent directory isn't picked up.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
