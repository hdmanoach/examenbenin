// ============================================================
// SITEMAP — aide Google à trouver et indexer toutes les pages
// Accessible sur : https://ton-site.vercel.app/sitemap.xml
// ============================================================

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // On force l'URL de production — pas de variable d'environnement
  const siteUrl = 'https://examenbenin.vercel.app'

  return [
    {
      url:             siteUrl,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${siteUrl}/suggestions`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
  ]
}