// next.config.js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix: basePath,
  output: 'export',          // NEW: generates static HTML automatically
  experimental: {
    images: {
      allowFutureImage: true // if you use next/image with static export
    }
  }
};

module.exports = nextConfig;
