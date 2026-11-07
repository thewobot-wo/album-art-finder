import type { NextConfig } from 'next';
import { BASE_PATH } from './lib/basePath';

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  poweredByHeader: false,
  // Artwork comes straight from the source CDNs; next/image isn't used.
  images: { unoptimized: true },
  // Keeps the old play-art.vercel.app address working. criswo.com never reaches
  // this: its own project only forwards /playart paths here.
  async redirects() {
    return [{ source: '/', destination: BASE_PATH, basePath: false, permanent: false }];
  },
  // Pin the root so a stray lockfile in a parent directory isn't picked up.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
