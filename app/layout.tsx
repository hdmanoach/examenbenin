import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ExamBénin — Prépare ton examen national',
  description:
    'Plateforme de préparation aux examens nationaux du Bénin. Épreuves ASSRI et SIL, sessions pratiques et théoriques, classées par année.',
  keywords: ['bénin', 'examen', 'ASSRI', 'SIL', 'épreuves', 'révision', 'BAC', 'épreuve pratique', ' épreuve théorie'],
  openGraph: {
    title: 'ExamBénin',
    description: 'Prépare ton examen national avec les vraies épreuves',
    locale: 'fr_BJ',
    type: 'website',
    url: '',
  },
  icons: {
    icon:    '/favicon.svg',         // onglet navigateur
    apple:   '/favicon.svg',         // iPhone/iPad
    shortcut: '/favicon.svg',        // raccourci bureau
  },
  // Permet aux moteurs de recherche d'indexer le site
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
