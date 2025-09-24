/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // fully static export
  basePath: '/fantasy-map-builder', // your repo name
  assetPrefix: '/fantasy-map-builder/', // for CSS/JS/images to load correctly
  reactStrictMode: true,
  images: {
    unoptimized: true,           // prevent Next.js optimization (static export)
  },
};

module.exports = nextConfig;
