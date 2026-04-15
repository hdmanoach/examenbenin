// ============================================================
// COMPOSANT : CarteEpreuve
// Affiche une épreuve avec compteur de vues
// ============================================================

import { FileText, Eye, Download, BookOpen } from 'lucide-react'
import type { Epreuve } from '../lib/epreuves'

interface CarteEpreuveProps {
  epreuve:  Epreuve
  onOuvrir: (epreuve: Epreuve) => void
}

export default function CarteEpreuve({ epreuve, onOuvrir }: CarteEpreuveProps) {
  const estRevision = epreuve.type === 'revision'

  return (
    <div className="carte-epreuve h-full bg-[#111a14] border border-[#1e2e21] rounded-2xl p-5 flex flex-col gap-4">

      {/* En-tête : icône + titre + année + vues */}
      <div className="flex items-start justify-between gap-3">

        {/* Icône + titre */}
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            estRevision
              ? 'bg-purple-900/40 border border-purple-500/30'
              : 'bg-[#008751]/20 border border-[#008751]/30'
          }`}>
            {estRevision
              ? <BookOpen size={18} className="text-purple-400" />
              : <FileText size={18} className="text-[#008751]" />
            }
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {epreuve.titre}
            </h3>
            <p className="text-[#8fa895] text-xs mt-0.5">{epreuve.matiere}</p>
          </div>
        </div>

        {/* Colonne droite : année + compteur de vues */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">

          {/* Année */}
          <span className="text-[#FCD116] text-xs font-bold bg-[#FCD116]/10 border border-[#FCD116]/20 px-2 py-1 rounded-lg">
            {epreuve.annee}
          </span>

          {/* Compteur de vues — petit cercle avec le nombre */}
          <div
            className="flex items-center gap-1 bg-[#1e2e21] border border-[#2a3f2d] px-2 py-0.5 rounded-full"
            title={`${epreuve.vues} consultation${epreuve.vues !== 1 ? 's' : ''}`}
          >
            <Eye size={10} className="text-[#8fa895]" />
            <span className="text-[#8fa895] text-xs font-medium">
              {/* Formater les grands nombres : 1200 → 1.2k */}
              {epreuve.vues >= 1000
                ? `${(epreuve.vues / 1000).toFixed(1)}k`
                : epreuve.vues
              }
            </span>
          </div>
        </div>
      </div>

      {/* Badges filière + session */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Badge filière — affiche le code dynamique */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${
          epreuve.filiere === 'ASSRI' ? 'badge-assri' :
          epreuve.filiere === 'SIL'   ? 'badge-sil'   :
          'bg-[#1e2e21] border border-[#2a3f2d]'  // style par défaut pour nouvelles filières
        }`}>
          {epreuve.filiere}
        </span>

        {/* Badge session */}
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
          epreuve.session === 'pratique'
            ? 'text-blue-300 bg-blue-900/30 border-blue-500/30'
            : 'text-orange-300 bg-orange-900/30 border-orange-500/30'
        }`}>
          {epreuve.session === 'pratique' ? '⚙️ Pratique' : '📖 Théorique'}
        </span>

        {/* Badge révision */}
        {estRevision && (
          <span className="text-xs px-2.5 py-1 rounded-full border font-medium text-purple-300 bg-purple-900/30 border-purple-500/30">
            📚 Révision
          </span>
        )}
      </div>

      {/* Description (si disponible) */}
      {epreuve.description && (
        <p className="text-[#8fa895] text-xs leading-relaxed border-t border-[#1e2e21] pt-3">
          {epreuve.description}
        </p>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2 mt-auto pt-2">

        {/* Consulter — incrémente les vues via onOuvrir */}
        <button
          onClick={() => onOuvrir(epreuve)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#008751] hover:bg-[#00a362] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#008751]/30"
        >
          <Eye size={15} />
          Consulter
        </button>

        {/* Télécharger */}
        <a
          href={epreuve.url_fichier}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-[#1e2e21] hover:bg-[#2a3f2d] text-[#8fa895] hover:text-white rounded-xl transition-all duration-200 border border-[#2a3f2d]"
          title="Télécharger"
        >
          <Download size={15} />
        </a>
      </div>
    </div>
  )
}
