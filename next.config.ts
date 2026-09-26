import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the root so a stray lockfile in a parent directory isn't picked up.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
