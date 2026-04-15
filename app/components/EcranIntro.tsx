'use client'

// ============================================================
// COMPOSANT : EcranIntro
// Affiche une citation inspirante pendant ~4 secondes
// avant de disparaître pour laisser place à la page principale
// ============================================================

import { useEffect, useState } from 'react'

interface EcranIntroProps {
  onTerminer?: () => void
}

export default function EcranIntro({ onTerminer }: EcranIntroProps) {
  const [texteAffiche, setTexteAffiche] = useState('')
  const [sousTexteVisible, setSousTexteVisible] = useState(false)
  const [visible, setVisible] = useState(true)

  // La citation affichée au lancement
  const citation = "Le succès appartient à ceux qui se préparent."
  const auteur = "— Benjamin Franklin"

  // Effet machine à écrire pour la citation
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < citation.length) {
        setTexteAffiche(citation.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        // Afficher l'auteur après la citation complète
        setTimeout(() => setSousTexteVisible(true), 200)
      }
    }, 45) // Vitesse de frappe (ms par caractère)

    return () => clearInterval(interval)
  }, [])

  // Masquer l'écran intro après 4.8s pour laisser place à la modale email
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onTerminer?.()
    }, 4800)

    return () => clearTimeout(timer)
  }, [onTerminer])

  if (!visible) return null

  return (
    <div className="ecran-intro fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0f0d] grille-fond">

      {/* Ligne tricolore décorative en haut */}
      <div className="absolute top-0 left-0 right-0 ligne-tricolore" />

      {/* Conteneur central */}
      <div className="max-w-2xl px-8 text-center">

        {/* Logo / Marque */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <div className="w-2 h-8 rounded-full bg-[#008751]" />
          <span
            className="text-lg font-semibold tracking-[0.2em] text-[#8fa895] uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            ExamBénin
          </span>
          <div className="w-2 h-8 rounded-full bg-[#EF2B2D]" />
        </div>

        {/* Citation animée */}
        <p
          className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6 curseur"
          style={{ fontFamily: 'var(--font-display)', minHeight: '3rem' }}
        >
          {texteAffiche}
        </p>

        {/* Auteur de la citation */}
        <p
          className="text-[#8fa895] text-lg italic transition-all duration-700"
          style={{
            opacity: sousTexteVisible ? 1 : 0,
            transform: sousTexteVisible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {auteur}
        </p>

        {/* Barre de progression */}
        <div className="mt-16 w-48 mx-auto h-0.5 bg-[#1e2e21] rounded overflow-hidden">
          <div
            className="h-full bg-[#008751] rounded"
            style={{
              animation: 'progresser 3.8s ease forwards',
            }}
          />
        </div>
      </div>

      {/* Ligne tricolore en bas */}
      <div className="absolute bottom-0 left-0 right-0 ligne-tricolore" />

      {/* Animation CSS de la barre de progression */}
      <style>{`
        @keyframes progresser {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
