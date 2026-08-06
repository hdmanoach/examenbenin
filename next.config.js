/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ── Empêche le clickjacking ──────────────────────
          {
            key:   'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          //
          {
            key:   'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          // ── Empêche le sniffing de type MIME ─────────────
          {
            key:   'X-Content-Type-Options',
            value: 'nosniff',
          },
          // ── Force HTTPS ──────────────────────────────────
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // ── Contrôle le referrer ─────────────────────────
          {
            key:   'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ── Permissions navigateur ───────────────────────
          {
            key:   'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // ── Content Security Policy ──────────────────────
          {
            key:   'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js en a besoin
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://*.supabase.co",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
      // ── CORS pour la route API notifier ──────────────────
      {
        source: '/api/notifier',
        headers: [
          {
            key:   'Access-Control-Allow-Origin',
            value: process.env.ADMIN_APP_URL || 'http://localhost:3001',
          },
          {
            key:   'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key:   'Access-Control-Allow-Headers',
            value: 'Content-Type, x-api-key',
          },
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