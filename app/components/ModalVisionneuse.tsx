'use client'

// ============================================================
// COMPOSANT : ModalVisionneuse
// Ouvre une fenêtre modale pour afficher un PDF ou une image
// ============================================================

import { useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import type { Epreuve } from '../lib/epreuves'

interface ModalVisionneuseProps {
  epreuve: Epreuve | null
  onFermer: () => void
}

export default function ModalVisionneuse({ epreuve, onFermer }: ModalVisionneuseProps) {

  // Fermer avec la touche Échap
  useEffect(() => {
    const gererTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
    }
    document.addEventListener('keydown', gererTouche)
    // Bloquer le défilement de la page derrière le modal
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', gererTouche)
      document.body.style.overflow = 'unset'
    }
  }, [onFermer])

  if (!epreuve) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fonduEntree 0.25s ease forwards' }}
    >
      {/* Fond sombre cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onFermer}
      />

      {/* Fenêtre modale */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#111a14] rounded-2xl border border-[#1e2e21] flex flex-col overflow-hidden shadow-2xl">

        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2e21] bg-[#0d1610] flex-shrink-0">
          <div>
            <h2
              className="text-white font-bold text-base"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {epreuve.titre}
            </h2>
            <p className="text-[#8fa895] text-xs mt-0.5">
              {epreuve.filiere} · {epreuve.matiere} · {epreuve.annee}
            </p>
          </div>

          {/* Boutons de droite */}
          <div className="flex items-center gap-2">

            {/* Ouvrir dans un nouvel onglet */}
            {/* url_fichier remplace l'ancien urlFichier */}
            
            <a  href={epreuve.url_fichier}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#8fa895] hover:text-white bg-[#1e2e21] hover:bg-[#2a3f2d] px-3 py-2 rounded-xl transition-all"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Nouvel onglet</span>
            </a>

            {/* Télécharger */}
            
            <a  href={epreuve.url_fichier}
              download
              className="flex items-center gap-2 text-sm text-white bg-[#008751] hover:bg-[#00a362] px-3 py-2 rounded-xl transition-all"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Télécharger</span>
            </a>

            {/* Fermer */}
            <button
              onClick={onFermer}
              className="w-9 h-9 flex items-center justify-center text-[#8fa895] hover:text-white bg-[#1e2e21] hover:bg-red-900/40 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Zone d'affichage du fichier */}
        <div className="flex-1 overflow-hidden bg-[#0a0f0d]">

          {/* type_fichier remplace l'ancien typesFichier */}
          {epreuve.type_fichier === 'pdf' ? (
            // Affichage PDF dans un iframe
            <iframe
              src={`${epreuve.url_fichier}#toolbar=1&view=FitH`}
              className="w-full h-full"
              title={epreuve.titre}
            >
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-[#8fa895] mb-4">
                  Votre navigateur ne peut pas afficher ce PDF directement.
                </p>
                
                <a  href={epreuve.url_fichier}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#008751] underline"
                >
                  Cliquez ici pour l&apos;ouvrir
                </a>
              </div>
            </iframe>
          ) : (
            // Affichage image
            <div className="flex items-center justify-center h-full overflow-auto p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={epreuve.url_fichier}
                alt={epreuve.titre}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}