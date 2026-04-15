// ============================================================
// ROBOTS.TXT — dit aux moteurs de recherche quoi indexer
// Accessible sur : https://ton-site.vercel.app/robots.txt
// ============================================================

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ton-site.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow:     '/',         // tout le site est indexable
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}