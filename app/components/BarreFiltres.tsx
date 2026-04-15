'use client'

// ============================================================
// COMPOSANT : BarreFiltres
// Filtres dynamiques — les filières viennent de Supabase
// ============================================================

import { Filter, RotateCcw } from 'lucide-react'
import { ANNEES_DISPONIBLES, type Filiere, type Session, type TypeBloc } from '../lib/epreuves'

interface FiltresActifs {
  filiere: string | null
  session: Session | null
  annee:   number  | null
  type:    TypeBloc | null
}

interface BarreFiltresProps {
  filtres:          FiltresActifs
  filieres:         Filiere[]          // filières dynamiques depuis Supabase
  onChangerFiltre:  (cle: keyof FiltresActifs, valeur: string | number | null) => void
  onReinitialiser:  () => void
  nombreResultats:  number
}

export default function BarreFiltres({
  filtres,
  filieres,
  onChangerFiltre,
  onReinitialiser,
  nombreResultats,
}: BarreFiltresProps) {
  const aucunFiltre = !filtres.filiere && !filtres.session && !filtres.annee && !filtres.type

  // Couleurs pour les filières dynamiques
  const couleurFiliere = (code: string) => {
    const couleurs: Record<string, string> = {
      ASSRI: 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30',
      SIL:   'bg-[#b8860b] text-white shadow-lg shadow-[#FCD116]/20',
    }
    // Couleur par défaut pour les nouvelles filières
    return couleurs[code] || 'bg-[#1a3a5c] text-white shadow-lg shadow-blue-900/30'
  }

  return (
    <div className="bg-[#111a14] border border-[#1e2e21] rounded-2xl p-5">

      {/* Titre + compteur */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#008751]" />
          <span className="text-white font-semibold text-sm"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Filtrer les épreuves
          </span>
        </div>
        <span className="text-[#8fa895] text-xs">
          {nombreResultats} résultat{nombreResultats !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">

        {/* ── Filière (dynamique depuis Supabase) ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[#8fa895] text-xs uppercase tracking-wider">Filière</label>
          <div className="flex gap-2 flex-wrap">
            {filieres.map(f => (
              <button
                key={f.id}
                onClick={() => onChangerFiltre('filiere', filtres.filiere === f.code ? null : f.code)}
                title={f.nom}  // Affiche le nom complet au survol
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  filtres.filiere === f.code
                    ? couleurFiliere(f.code)
                    : 'bg-[#1e2e21] text-[#8fa895] hover:text-white hover:bg-[#2a3f2d] border border-[#2a3f2d]'
                }`}
              >
                {f.code}
              </button>
            ))}
          </div>
        </div>

        {/* ── Session ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[#8fa895] text-xs uppercase tracking-wider">Session</label>
          <div className="flex gap-2">
            {[
              { valeur: 'pratique'  as Session, label: '⚙️ Pratique' },
              { valeur: 'theorique' as Session, label: '📖 Théorique' },
            ].map(({ valeur, label }) => (
              <button
                key={valeur}
                onClick={() => onChangerFiltre('session', filtres.session === valeur ? null : valeur)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filtres.session === valeur
                    ? valeur === 'pratique'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-[#1e2e21] text-[#8fa895] hover:text-white hover:bg-[#2a3f2d] border border-[#2a3f2d]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Année ── */}
        {/* ── Année — 6 par page avec pagination ── */}
        <div className="flex flex-col gap-2">
          <label className="block text-[#8fa895] text-xs uppercase tracking-wider">Année</label>
          <div className="flex gap-2 flex-wrap max-w-xs">
            {ANNEES_DISPONIBLES.map(annee => (
              <button
                key={annee}
                onClick={() => onChangerFiltre('annee', filtres.annee === annee ? null : annee)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  filtres.annee === annee
                    ? 'bg-[#FCD116] text-[#0a0f0d] shadow-lg shadow-[#FCD116]/30'
                    : 'bg-[#1e2e21] text-[#8fa895] hover:text-white hover:bg-[#2a3f2d] border border-[#2a3f2d]'
                }`}
              >
                {annee}
              </button>
            ))}
          </div>
        </div>

        {/* ── Réinitialiser ── */}
        {!aucunFiltre && (
          <div className="flex flex-col gap-2">
            <label className="text-[#8fa895] text-xs uppercase tracking-wider opacity-0">Reset</label>
            <button
              onClick={onReinitialiser}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#8fa895] hover:text-white bg-[#1e2e21] hover:bg-red-900/40 border border-[#2a3f2d] transition-all"
            >
              <RotateCcw size={13} />
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
