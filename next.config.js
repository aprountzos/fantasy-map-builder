/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  output: 'export', // generates static HTML for GitHub Pages
  experimental: {
    images: {
      allowFutureImage: true
    }
  }
};

module.exports = nextConfig;
