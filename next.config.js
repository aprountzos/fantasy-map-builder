/** @type {import('next').NextConfig} */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',              // fully static export
  basePath: basePath, // your repo name
  assetPrefix: basePath, // for CSS/JS/images to load correctly
  reactStrictMode: true,

};

module.exports = nextConfig;
