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
  // Superseded admin URLs. Handled by the router with no page render
  // (previously stub pages using getServerSideProps). permanent: false = 307.
  async redirects() {
    return [
      {
        source: '/admin/show/show-customization-requests',
        destination: '/admin/show/show-orders?tab=custom',
        permanent: false,
      },
      {
        source: '/admin/show/show-order-details',
        destination: '/admin/show/show-orders',
        permanent: false,
      },
      {
        source: '/admin/update-category/:id',
        destination: '/admin/show/show-all-series',
        permanent: false,
      },
      {
        source: '/admin/update-category/change-category-image/:id',
        destination: '/admin/show/show-all-series',
        permanent: false,
      },
    ];
  },
  // nextConfig
}