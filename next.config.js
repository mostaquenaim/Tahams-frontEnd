/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    // WebP only: AVIF encoding is far more CPU-expensive on a 1 vCPU box.
    formats: ['image/webp'],
    // Keep optimized images for a day instead of re-encoding every 60s.
    minimumCacheTTL: 86400,
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
  // Let browsers cache files from /public (images, video, icons, fonts) for a
  // day instead of revalidating them on every page view. Data files (.json)
  // and pages are not matched. Pages get Cache-Control from Next itself, and
  // /_next/static is already cached as immutable.
  // Note: the pattern deliberately needs a real ".ext" so a product slug
  // ending in e.g. "-png" is not matched.
  async headers() {
    return [
      {
        source:
          '/:path*.:ext(svg|jpg|jpeg|png|webp|avif|gif|ico|mp4|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
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