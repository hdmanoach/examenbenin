// ============================================================
// ROBOTS.TXT — dit aux moteurs de recherche quoi indexer
// Accessible sur : https://ton-site.vercel.app/robots.txt
// ============================================================

import { MetadataRoute } from 'next'
import { getSiteUrl } from './lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow:     '/',         // tout le site est indexable
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
