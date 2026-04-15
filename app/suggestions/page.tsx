'use client'

// ============================================================
// PAGE : Suggestions & Donations
// Les visiteurs envoient leurs suggestions
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Heart, Send, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/epreuves'

export default function PageSuggestions() {
  // ── État formulaire suggestions ───────────────────────────
  const [form, setForm] = useState({ nom: '', email: '', message: '' })
  const [envoi, setEnvoi]               = useState(false)
  const [envoye, setEnvoye]             = useState(false)
  const [erreur, setErreur]             = useState('')

  // ── Soumettre une suggestion ──────────────────────────────
  const soumettre = async () => {
    if (!form.nom.trim() || !form.message.trim()) {
      setErreur('Le prénom et le message sont obligatoires.')
      return
    }
    setEnvoi(true)
    setErreur('')

    const { error } = await supabase
      .from('suggestions')
      .insert({
        nom:     form.nom.trim(),
        email:   form.email.trim() || null,
        message: form.message.trim(),
      })

    setEnvoi(false)

    if (error) {
      setErreur('Erreur lors de l\'envoi. Réessaie.')
      return
    }

    setEnvoye(true)
    setForm({ nom: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] grille-fond">
      <div className="ligne-tricolore" />

      {/* Bouton retour */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#8fa895] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Retour aux épreuves
        </Link>
      </div>

      {/* En-tête */}
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Aide-nous à grandir 🌱
        </h1>
        <p className="text-[#8fa895] text-lg max-w-xl mx-auto">
          ExamBénin est un projet communautaire. Tes suggestions et ton soutien
          nous aident à améliorer la plateforme pour tous les étudiants.
        </p>
      </div>

      {/* Grille côte à côte */}
      <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ══ BLOC SUGGESTIONS ═══════════════════════════════ */}
        <div className="bg-[#111a14] border border-[#1e2e21] rounded-2xl p-6">
          <h2
            className="text-white font-bold text-lg flex items-center gap-2 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <MessageSquare size={18} className="text-[#008751]" />
            Fais une suggestion
          </h2>
          <p className="text-[#8fa895] text-sm mb-6">
            Manque une filière ? Une matière ? Dis-nous ce qu&apos;on peut améliorer.
          </p>

          {envoye ? (
            // Confirmation envoi
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle size={40} className="text-[#008751]" />
              <p className="text-white font-bold text-lg">Merci pour ta suggestion !</p>
              <p className="text-[#8fa895] text-sm">
                On prend ça en compte pour améliorer ExamBénin.
              </p>
              <button
                onClick={() => setEnvoye(false)}
                className="mt-2 text-[#008751] text-sm hover:underline"
              >
                Envoyer une autre suggestion
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Prénom */}
              <div>
                <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
                  Ton prénom *
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                  placeholder="Ex: Kofi"
                  className="w-full bg-[#0d1610] border border-[#1e2e21] focus:border-[#008751] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#8fa895]"
                />
              </div>

              {/* Email optionnel */}
              <div>
                <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
                  Email <span className="text-[#8fa895]/50 normal-case">(optionnel — pour qu&apos;on te réponde)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="ton.email@exemple.com"
                  className="w-full bg-[#0d1610] border border-[#1e2e21] focus:border-[#008751] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#8fa895]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
                  Ta suggestion *
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Ex: Ajouter la filière TSRI, les épreuves de 2020..."
                  rows={4}
                  className="w-full bg-[#0d1610] border border-[#1e2e21] focus:border-[#008751] rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors placeholder:text-[#8fa895] resize-none"
                />
              </div>

              {/* Erreur */}
              {erreur && (
                <p className="text-red-400 text-xs">{erreur}</p>
              )}

              {/* Bouton envoyer */}
              <button
                onClick={soumettre}
                disabled={envoi || !form.nom || !form.message}
                className="w-full bg-[#008751] hover:bg-[#00a362] disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {envoi
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Send size={15} />
                }
                {envoi ? 'Envoi...' : 'Envoyer ma suggestion'}
              </button>
            </div>
          )}
        </div>

        {/* ══ BLOC DONATIONS — Bientôt disponible ══════════════ */}
        <div className="bg-[#111a14] border border-[#1e2e21] rounded-2xl p-6">
          <h2
            className="text-white font-bold text-lg flex items-center gap-2 mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Heart size={18} className="text-[#EF2B2D]" />
            Soutenir le projet
          </h2>
          <p className="text-[#8fa895] text-sm mb-6">
            ExamBénin est gratuit pour tous les étudiants. Chaque don aide à
            couvrir les frais et à ajouter de nouvelles épreuves.
          </p>

          {/* Ce que le don couvre */}
          {/*<div className="bg-[#0d1610] border border-[#1e2e21] rounded-xl p-4 mb-6">
            <p className="text-[#8fa895] text-xs uppercase tracking-wider mb-3">
              À quoi ça sert ?
            </p>
            <div className="flex flex-col gap-2">
              {[
                { montant: '500 F',   usage: 'Hébergement du site (1 mois)' },
                { montant: '1 000 F', usage: 'Stockage des épreuves (1 mois)' },
                { montant: '5 000 F', usage: 'Ajout de 50 nouvelles épreuves' },
              ].map(({ montant, usage }) => (
                <div key={montant} className="flex items-center gap-3">
                  <span className="text-[#FCD116] font-bold text-sm w-16 flex-shrink-0">
                    {montant}
                  </span>
                  <span className="text-[#8fa895] text-xs">{usage}</span>
                </div>
              ))}
            </div>
          </div>*/}
          {/* Montants suggérés (désactivés) */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[500, 1000, 2000, 5000, 10000, 0].map(m => (
              <div
                key={m}
                className="py-2 rounded-xl text-sm font-bold text-center bg-[#0d1610] border border-[#1e2e21] text-[#8fa895]/40 cursor-not-allowed select-none"
              >
                {m === 0 ? 'Autre' : `${m.toLocaleString()} F`}
              </div>
            ))}
          </div>

          {/* Bouton principal — bientôt disponible */}
          <div className="relative">
            <button
              disabled
              className="w-full bg-[#FCD116]/30 text-[#0a0f0d]/50 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>📱</span>
              Payer via FedaPay
            </button>

            {/* Badge bientôt */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-[#111a14] border border-[#FCD116]/40 text-[#FCD116] text-xs font-bold px-4 py-1.5 rounded-full">
                🔜 Bientôt disponible
              </span>
            </div>
          </div>

          {/* Modes de paiement à venir */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {['MTN Money', 'Moov Money', 'Carte bancaire'].map(mode => (
              <span
                key={mode}
                className="text-[#8fa895]/50 text-xs px-2 py-1 bg-[#0d1610] border border-[#1e2e21] rounded-lg"
              >
                {mode}
              </span>
            ))}
          </div>

          <p className="text-[#8fa895]/50 text-xs text-center mt-3">
            🔒 Paiements sécurisés via FedaPay
          </p>
        </div>
      </div>
    </div>
  )
}
