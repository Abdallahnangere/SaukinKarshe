/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    AMIGO_BASE_URL: process.env.AMIGO_BASE_URL,
  }
};

module.exports = nextConfig;