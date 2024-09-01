/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_HOSTNAME,
        port: process.env.NEXT_PUBLIC_PORT,
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