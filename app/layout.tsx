import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://examenbenin.vercel.app'
const siteName = 'ExamBénin'
const siteTitle = 'ExamBénin | Épreuves et révisions des examens nationaux du Bénin'
const siteDescription =
  'ExamBénin est une plateforme de préparation aux examens nationaux du Bénin avec des épreuves officielles, des documents de révision et des filtres par filière, session et année.'
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'ExamBénin',
    'exam benin',
    'examen benin',
    'épreuves Bénin',
    'examens nationaux du Bénin',
    'épreuves officielles Bénin',
    'révision Bénin',
    'ASSRI',
    'SIL',
    'BAC Bénin',
    'épreuve pratique',
    'épreuve théorique',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName,
    locale: 'fr_BJ',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: googleSiteVerification,
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: 'fr-BJ',
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
  }

  return (
    <html lang="fr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  )
}
