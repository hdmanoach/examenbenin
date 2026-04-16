// ============================================================
// SITEMAP — aide Google à trouver et indexer toutes les pages
// Accessible sur : https://ton-site.vercel.app/sitemap.xml
// ============================================================

import { MetadataRoute } from 'next'
import { getSiteUrl } from './lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return [
    {
      url:             siteUrl,
      lastModified:    new Date(),
      changeFrequency: 'daily',   // la page change souvent (nouvelles épreuves)
      priority:        1.0,       // page la plus importante
    },
    {
      url:             `${siteUrl}/suggestions`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
  ]
}
