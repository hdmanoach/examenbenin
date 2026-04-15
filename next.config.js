/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Appliquer les headers CORS sur la route /api/notifier
        source: '/api/notifier',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: 'http://localhost:3001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

module.exports = nextConfig