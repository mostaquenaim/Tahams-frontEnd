/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_HOSTNAME || 'tahamsbd.com',
        port: process.env.NEXT_PUBLIC_PORT || '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Adjust this to your development server's port if different
      },
      {
        protocol: 'https',
        hostname: 'tahamsbd.com',
      },
    ],
  },
  // nextConfig
}