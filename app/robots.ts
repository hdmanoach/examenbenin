// ============================================================
// ROBOTS.TXT — dit aux moteurs de recherche quoi indexer
// Accessible sur : https://ton-site.vercel.app/robots.txt
// ============================================================

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow:     '/',
    },
    sitemap: 'https://examenbenin.vercel.app/sitemap.xml',
  }
}
