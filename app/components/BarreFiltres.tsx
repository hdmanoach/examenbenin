'use client'

// ============================================================
// COMPOSANT : BarreFiltres
// Panneau accordéon — filières dynamiques depuis Supabase
// Sessions/types chargés dynamiquement selon la filière choisie
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { Filter, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  ANNEES_DISPONIBLES,
  obtenirOptionsFiliere,
  type Filiere,
  type Session,
  type TypeBloc,
} from '../lib/epreuves'

interface FiltresActifs {
  filiere: string   | null
  session: Session  | null
  annee:   number   | null
  type:    TypeBloc | null
}

interface BarreFiltresProps {
  filtres:         FiltresActifs
  filieres:        { id: string; code: string; nom: string }[]
  onChangerFiltre: (cle: keyof FiltresActifs, valeur: string | number | null) => void
  onReinitialiser: () => void
  nombreResultats: number
}

// Labels lisibles pour session et type
const LABELS_SESSION: Record<string, string> = {
  pratique:  '⚙️ Pratique',
  theorique: '📖 Théorique',
}
const LABELS_TYPE: Record<string, string> = {
  epreuve:  '📋 Épreuve officielle',
  revision: '📚 Révision',
}

// Couleurs des filières
const couleurFiliere = (code: string) => ({
  ASSRI: 'bg-[#008751] text-white',
  SIL:   'bg-[#b8860b] text-white',
} as Record<string, string>)[code] || 'bg-[#1a3a5c] text-white'

export default function BarreFiltres({
  filtres, filieres, onChangerFiltre, onReinitialiser, nombreResultats,
}: BarreFiltresProps) {
  const [ouvert, setOuvert]               = useState(false)
  const [sessionsDispos, setSessionsDispos] = useState<Session[]>([])
  const [typesDispos, setTypesDispos]       = useState<TypeBloc[]>([])
  const [chargementOptions, setChargementOptions] = useState(false)

  const aucunFiltre = !filtres.filiere && !filtres.session && !filtres.annee && !filtres.type

  // ── Charger les options disponibles quand une filière est sélectionnée ──
  const chargerOptions = useCallback(async (filiere: string) => {
    setChargementOptions(true)
    const { sessions, types } = await obtenirOptionsFiliere(filiere)
    setSessionsDispos(sessions)
    setTypesDispos(types)
    setChargementOptions(false)
  }, [])

  useEffect(() => {
    if (filtres.filiere) {
      chargerOptions(filtres.filiere)
    } else {
      // Aucune filière — réinitialiser les options
      setSessionsDispos([])
      setTypesDispos([])
    }
  }, [filtres.filiere, chargerOptions])

  // ── Badges des filtres actifs (affichés sur le bouton) ──
  const badgesActifs = [
    filtres.filiere && { cle: 'filiere' as keyof FiltresActifs, label: filtres.filiere },
    filtres.session && { cle: 'session' as keyof FiltresActifs, label: LABELS_SESSION[filtres.session] },
    filtres.type    && { cle: 'type'    as keyof FiltresActifs, label: LABELS_TYPE[filtres.type] },
    filtres.annee   && { cle: 'annee'   as keyof FiltresActifs, label: String(filtres.annee) },
  ].filter(Boolean) as { cle: keyof FiltresActifs; label: string }[]

  return (
    <div className="bg-[#111a14] border border-[#1e2e21] rounded-2xl overflow-hidden">

      {/* ── Bouton accordéon ── */}
      <button
        onClick={() => setOuvert(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#0d1610] transition-all"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#008751]" />
            <span className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              Filtrer
            </span>
          </div>

          {/* Badges filtres actifs */}
          {badgesActifs.map(({ cle, label }) => (
            <span
              key={cle}
              className="flex items-center gap-1 text-xs bg-[#008751]/20 border border-[#008751]/30 text-[#008751] px-2 py-0.5 rounded-full"
            >
              {label}
              <button
                onClick={e => { e.stopPropagation(); onChangerFiltre(cle, null) }}
                className="hover:text-white transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[#8fa895] text-xs">
            {nombreResultats} résultat{nombreResultats !== 1 ? 's' : ''}
          </span>
          {ouvert
            ? <ChevronUp  size={16} className="text-[#8fa895]" />
            : <ChevronDown size={16} className="text-[#8fa895]" />
          }
        </div>
      </button>

      {/* ── Panneau de filtres (accordéon) ── */}
      {ouvert && (
        <div className="border-t border-[#1e2e21] px-5 py-5 flex flex-col gap-5">

          {/* ── Filières ── */}
          <div>
            <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
              Filière
            </label>
            <div className="flex gap-2 flex-wrap">
              {filieres.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    // Si on clique sur la filière déjà sélectionnée → désélectionner
                    if (filtres.filiere === f.code) {
                      onChangerFiltre('filiere', null)
                      onChangerFiltre('session', null)
                      onChangerFiltre('type', null)
                    } else {
                      onChangerFiltre('filiere', f.code)
                      onChangerFiltre('session', null)
                      onChangerFiltre('type', null)
                    }
                  }}
                  title={f.nom}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    filtres.filiere === f.code
                      ? couleurFiliere(f.code)
                      : 'bg-[#0d1610] border border-[#1e2e21] text-[#8fa895] hover:text-white'
                  }`}
                >
                  {f.code}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sessions + Type — apparaissent seulement si filière sélectionnée ── */}
          {filtres.filiere && (
            <div>
              <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
                Session & Type
              </label>

              {chargementOptions ? (
                <div className="flex items-center gap-2 text-[#8fa895] text-xs">
                  <div className="w-3 h-3 border border-[#008751]/30 border-t-[#008751] rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {/* Sessions disponibles pour cette filière */}
                  {sessionsDispos.map(s => (
                    <button
                      key={s}
                      onClick={() => onChangerFiltre('session', filtres.session === s ? null : s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filtres.session === s
                          ? s === 'pratique'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                          : 'bg-[#0d1610] border border-[#1e2e21] text-[#8fa895] hover:text-white'
                      }`}
                    >
                      {LABELS_SESSION[s]}
                    </button>
                  ))}

                  {/* Types disponibles (Révision) — seulement si existe pour cette filière */}
                  {typesDispos.includes('revision') && (
                    <button
                      onClick={() => onChangerFiltre('type', filtres.type === 'revision' ? null : 'revision')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filtres.type === 'revision'
                          ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/30'
                          : 'bg-[#0d1610] border border-[#1e2e21] text-[#8fa895] hover:text-white'
                      }`}
                    >
                      {LABELS_TYPE['revision']}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Années ── */}
          <div>
            <label className="block text-[#8fa895] text-xs uppercase tracking-wider mb-2">
              Année
            </label>
            <div className="flex gap-2 flex-wrap">
              {ANNEES_DISPONIBLES.map(annee => (
                <button
                  key={annee}
                  onClick={() => onChangerFiltre('annee', filtres.annee === annee ? null : annee)}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    filtres.annee === annee
                      ? 'bg-[#FCD116] text-[#0a0f0d] shadow-lg shadow-[#FCD116]/30'
                      : 'bg-[#0d1610] border border-[#1e2e21] text-[#8fa895] hover:text-white'
                  }`}
                >
                  {annee}
                </button>
              ))}
            </div>
          </div>

          {/* ── Réinitialiser ── */}
          {!aucunFiltre && (
            <button
              onClick={() => { onReinitialiser(); }}
              className="flex items-center gap-2 text-sm text-[#8fa895] hover:text-white w-fit transition-colors"
            >
              <RotateCcw size={13} />
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      )}
    </div>
  )
}