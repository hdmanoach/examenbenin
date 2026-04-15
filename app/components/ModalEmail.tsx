'use client'

// ============================================================
// COMPOSANT : ModalEmail
// S'affiche après l'écran d'intro pour collecter les emails
// des visiteurs qui veulent recevoir les notifications
// ============================================================

import { useState } from 'react'
import { Bell, X, CheckCircle, Mail } from 'lucide-react'
import { inscrireEmail } from '../lib/epreuves'

interface ModalEmailProps {
  onFermer: () => void
}

export default function ModalEmail({ onFermer }: ModalEmailProps) {
  const [email, setEmail]           = useState('')
  const [chargement, setChargement] = useState(false)
  const [statut, setStatut]         = useState<'idle' | 'succes' | 'erreur'>('idle')
  const [message, setMessage]       = useState('')

  const soumettre = async () => {
    // Validation basique de l'email
    if (!email || !email.includes('@')) {
      setMessage('Veuillez entrer un email valide.')
      setStatut('erreur')
      return
    }

    setChargement(true)
    const resultat = await inscrireEmail(email)
    setChargement(false)

    setMessage(resultat.message)
    setStatut(resultat.succes || resultat.dejainscrit ? 'succes' : 'erreur')

    // Fermer automatiquement après 2s si succès
    if (resultat.succes) {
      setTimeout(onFermer, 2000)
    }
  }

  return (
    // Fond sombre
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ animation: 'fonduEntree 0.3s ease forwards' }}
    >
      <div className="w-full max-w-md bg-[#111a14] border border-[#1e2e21] rounded-2xl p-7 relative shadow-2xl"
        style={{ animation: 'glisserHaut 0.4s ease forwards' }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onFermer}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#8fa895] hover:text-white bg-[#1e2e21] rounded-lg transition-all"
        >
          <X size={14} />
        </button>

        {/* Icône */}
        <div className="w-14 h-14 bg-[#008751]/20 border border-[#008751]/40 rounded-2xl flex items-center justify-center mb-5 mx-auto">
          <Bell size={24} className="text-[#008751]" />
        </div>

        {/* Titre */}
        <h2 className="text-white text-xl font-bold text-center mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Reste informé 🇧🇯
        </h2>
        <p className="text-[#8fa895] text-sm text-center mb-6 leading-relaxed">
          Reçois une notification par email dès qu&apos;une nouvelle épreuve
          ou filière est ajoutée sur ExamBénin.
        </p>

        {/* Formulaire ou message de succès */}
        {statut === 'succes' ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={32} className="text-[#008751]" />
            <p className="text-white font-medium text-center">{message}</p>
          </div>
        ) : (
          <>
            {/* Champ email */}
            <div className="relative mb-3">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa895]" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatut('idle') }}
                onKeyDown={e => e.key === 'Enter' && soumettre()}
                placeholder="ton.email@exemple.com"
                className="w-full bg-[#0d1610] border border-[#1e2e21] focus:border-[#008751] rounded-xl pl-9 pr-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#8fa895]"
                autoFocus
              />
            </div>

            {/* Message d'erreur */}
            {statut === 'erreur' && (
              <p className="text-red-400 text-xs mb-3">{message}</p>
            )}

            {/* Bouton s'inscrire */}
            <button
              onClick={soumettre}
              disabled={!email || chargement}
              className="w-full bg-[#008751] hover:bg-[#00a362] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-3"
            >
              {chargement
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Bell size={15} />
              }
              {chargement ? 'Inscription...' : 'M\'inscrire aux notifications'}
            </button>

            {/* Lien non merci */}
            <button
              onClick={onFermer}
              className="w-full text-[#8fa895] hover:text-white text-sm py-2 transition-colors"
            >
              Non merci, continuer sans s&apos;inscrire →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
