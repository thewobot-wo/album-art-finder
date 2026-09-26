import type { NextConfig } from 'next';
import { BASE_PATH } from './lib/basePath';

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  // Pin the root so a stray lockfile in a parent directory isn't picked up.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
