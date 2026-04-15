'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BookOpen, GraduationCap, RefreshCw,
  ChevronRight, RotateCcw, ExternalLink, MessageSquare,
} from 'lucide-react'

import EcranIntro       from './components/EcranIntro'
import ModalEmail       from './components/ModalEmail'
import CarteEpreuve     from './components/CarteEpreuve'
import BarreFiltres     from './components/BarreFiltres'
import ModalVisionneuse from './components/ModalVisionneuse'

import {
  supabase,
  obtenirEpreuves,
  obtenirFilieres,
  filtrerEpreuves,
  incrementerVues,
  type Epreuve,
  type Filiere,
  type Session,
  type TypeBloc,
} from './lib/epreuves'

interface FiltresActifs {
  filiere: string   | null
  session: Session  | null
  annee:   number   | null
  type:    TypeBloc | null
}

const FILTRES_PAR_DEFAUT: FiltresActifs = {
  filiere: null, session: null, annee: null, type: null,
}

// Nombre d'épreuves affichées par page
const PAR_PAGE = 8

type OngletActif = 'epreuves' | 'revision'

export default function PagePrincipale() {
  const [onglet, setOnglet]                       = useState<OngletActif>('epreuves')
  const [filtres, setFiltres]                     = useState<FiltresActifs>(FILTRES_PAR_DEFAUT)
  const [epreuveOuverte, setEpreuveOuverte]       = useState<Epreuve | null>(null)
  const [modalEmailVisible, setModalEmailVisible] = useState(false)
  const [filieres, setFilieres]                   = useState<Filiere[]>([])
  const [epreuvesFiltrees, setEpreuvesFiltrees]   = useState<Epreuve[]>([])
  const [chargement, setChargement]               = useState(false)
  const [stats, setStats]                         = useState({ total: 0, revision: 0 })

  // ── Pagination ────────────────────────────────────────────
  const [page, setPage]   = useState(1)
  const totalPages        = Math.ceil(epreuvesFiltrees.length / PAR_PAGE)
  const epreuvesDeLaPage  = epreuvesFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)

  // ── Charger les stats ────────────────────────────────────
  const chargerStats = useCallback(async () => {
    const toutes = await obtenirEpreuves()
    setStats({
      total:    toutes.filter(e => e.type === 'epreuve').length,
      revision: toutes.filter(e => e.type === 'revision').length,
    })
  }, [])

  // ── Charger les épreuves filtrées ─────────────────────────
  const chargerEpreuves = useCallback(async (
    filtresActifs: FiltresActifs,
    ongletActif: OngletActif
  ) => {
    setChargement(true)
    const resultats = await filtrerEpreuves({
      ...filtresActifs,
      type: ongletActif === 'revision' ? 'revision' : 'epreuve',
    })
    setEpreuvesFiltrees(resultats)
    setPage(1) // Revenir à la page 1 à chaque rechargement
    setChargement(false)
  }, [])

  // ── Initialisation au démarrage ───────────────────────────
  useEffect(() => {
    const init = async () => {
      const [, listeFilieres] = await Promise.all([
        chargerStats(),
        obtenirFilieres(),
      ])
      setFilieres(listeFilieres)
    }
    init()
  }, [chargerStats])

  // ── Realtime Supabase ─────────────────────────────────────
  useEffect(() => {
    const canal = supabase
      .channel('epreuves_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'epreuves' },
        () => {
          chargerStats()
          chargerEpreuves(filtres, onglet)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(canal) }
  }, [filtres, onglet, chargerStats, chargerEpreuves])

  // ── Recharger à chaque changement de filtre ou d'onglet ──
  useEffect(() => {
    chargerEpreuves(filtres, onglet)
  }, [filtres, onglet, chargerEpreuves])

  // ── Modal email après l'intro ────────────────────────────
  useEffect(() => {
    const dernierAffichage = localStorage.getItem('modal_email_date')
    const septJours = 7 * 24 * 60 * 60 * 1000
    if (dernierAffichage && Date.now() - Number(dernierAffichage) < septJours) return
    const timer = setTimeout(() => {
      setModalEmailVisible(true)
      localStorage.setItem('modal_email_date', String(Date.now()))
    }, 4800)
    return () => clearTimeout(timer)
  }, [])

  // ── Ouvrir épreuve + incrémenter les vues ────────────────
  const ouvrirEpreuve = async (epreuve: Epreuve) => {
    setEpreuveOuverte(epreuve)
    await incrementerVues(epreuve.id)
    setEpreuvesFiltrees(prev =>
      prev.map(e => e.id === epreuve.id ? { ...e, vues: e.vues + 1 } : e)
    )
  }

  // ── Gestionnaires filtres ─────────────────────────────────
  const changerFiltre = (cle: keyof FiltresActifs, valeur: string | number | null) => {
    setFiltres(prev => ({ ...prev, [cle]: valeur }))
    setPage(1) // Revenir page 1 à chaque filtre
  }

  const reinitialiserFiltres = () => {
    setFiltres(FILTRES_PAR_DEFAUT)
    setPage(1)
  }

  // ── Changer de page + scroll en haut ─────────────────────
  const allerPage = (n: number) => {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <EcranIntro />

      {modalEmailVisible && (
        <ModalEmail onFermer={() => setModalEmailVisible(false)} />
      )}

      <div className="contenu-principal min-h-screen bg-[#0a0f0d] grille-fond">
        <div className="ligne-tricolore" />

        {/* ══ EN-TÊTE ══════════════════════════════════════ */}
        <header className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#008751]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">

            <div className="inline-flex items-center gap-2 bg-[#111a14] border border-[#1e2e21] rounded-full px-4 py-2 mb-8">
              <span className="text-lg">🇧🇯</span>
              <span className="text-[#8fa895] text-sm tracking-wide">République du Bénin</span>
              <ChevronRight size={14} className="text-[#008751]" />
              <span className="text-[#FCD116] text-sm font-semibold">Examens Nationaux</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Exam<span className="text-[#008751]">Bénin</span>
            </h1>

            <p className="text-[#8fa895] text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              La plateforme de référence pour préparer ton examen national.<br />
              <span className="text-white/80">Épreuves officielles classées, session pratique &amp; théorique.</span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { valeur: stats.total,     label: 'Épreuves',      couleur: 'text-[#008751]' },
                { valeur: filieres.length, label: 'Filières',       couleur: 'text-[#FCD116]' },
                { valeur: stats.revision,  label: 'Docs révision',  couleur: 'text-purple-400' },
              ].map(({ valeur, label, couleur }) => (
                <div key={label} className="bg-[#111a14] border border-[#1e2e21] rounded-2xl px-6 py-4 text-center min-w-[100px]">
                  <div className={`text-3xl font-extrabold ${couleur}`}
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {valeur}
                  </div>
                  <div className="text-[#8fa895] text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ══ ONGLETS ══════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-2 bg-[#111a14] border border-[#1e2e21] rounded-2xl p-1.5 w-fit mb-8">
            <button
              onClick={() => { setOnglet('epreuves'); reinitialiserFiltres() }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                onglet === 'epreuves'
                  ? 'bg-[#008751] text-white shadow-lg shadow-[#008751]/30'
                  : 'text-[#8fa895] hover:text-white'
              }`}
            >
              <GraduationCap size={16} />
              Épreuves officielles
            </button>
            <button
              onClick={() => { setOnglet('revision'); reinitialiserFiltres() }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                onglet === 'revision'
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/30'
                  : 'text-[#8fa895] hover:text-white'
              }`}
            >
              <BookOpen size={16} />
              Bloc Révision
            </button>
          </div>
          <p className="text-[#8fa895] text-sm mb-6">
            {onglet === 'epreuves'
              ? ' Toutes les épreuves officielles, filtrées par filière, session et année.'
              : ' Documents de révision et anciennes épreuves pour renforcer tes connaissances.'}
          </p>
        </div>

        {/* ══ FILTRES ══════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <BarreFiltres
            filtres={filtres}
            filieres={filieres}
            onChangerFiltre={changerFiltre}
            onReinitialiser={reinitialiserFiltres}
            nombreResultats={epreuvesFiltrees.length}
          />
        </div>

        {/* ══ GRILLE DES ÉPREUVES ══════════════════════════ */}
        <main className="max-w-6xl mx-auto px-6 pb-20">
          {chargement ? (
            // Spinner de chargement
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 border-2 border-[#008751]/30 border-t-[#008751] rounded-full animate-spin" />
            </div>

          ) : epreuvesFiltrees.length > 0 ? (
            <>
              {/* Grille — seulement les 8 de la page courante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                {epreuvesDeLaPage.map((epreuve, index) => (
                  <div key={epreuve.id} className="h-full"
                    style={{ animation: `glisserHaut 0.5s ease ${index * 0.05}s both` }}
                  >
                    <CarteEpreuve epreuve={epreuve} onOuvrir={ouvrirEpreuve} />
                  </div>
                ))}
              </div>

              {/* Pagination — s'affiche seulement s'il y a plus de 8 épreuves */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1e2e21]">

                  {/* Compteur */}
                  <p className="text-[#8fa895] text-xs">
                    Page {page} sur {totalPages} · {epreuvesFiltrees.length} épreuve{epreuvesFiltrees.length !== 1 ? 's' : ''}
                  </p>

                  {/* Boutons de navigation */}
                  <div className="flex gap-2 flex-wrap">

                    {/* Précédent */}
                    <button
                      onClick={() => allerPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[#111a14] border border-[#1e2e21] text-[#8fa895] hover:text-white disabled:opacity-30 transition-all"
                    >
                      ← Précédent
                    </button>

                    {/* Numéros */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => allerPage(n)}
                        className={`w-8 h-8 text-xs rounded-xl transition-all ${
                          page === n
                            ? 'bg-[#008751] text-white'
                            : 'bg-[#111a14] border border-[#1e2e21] text-[#8fa895] hover:text-white'
                        }`}
                      >
                        {n}
                      </button>
                    ))}

                    {/* Suivant */}
                    <button
                      onClick={() => allerPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[#111a14] border border-[#1e2e21] text-[#8fa895] hover:text-white disabled:opacity-30 transition-all"
                    >
                      Suivant →
                    </button>
                  </div>
                </div>
              )}
            </>

          ) : (
            // Aucun résultat
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-[#111a14] rounded-2xl flex items-center justify-center mb-4 border border-[#1e2e21]">
                <RefreshCw size={24} className="text-[#8fa895]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Aucune épreuve trouvée
              </h3>
              <p className="text-[#8fa895] text-sm mb-6 max-w-sm">
                Nous n&apos;avons pas encore cette épreuve. Tu peux vérifier
                sur le site officiel du MESRS Bénin.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={reinitialiserFiltres}
                  className="flex items-center gap-2 text-sm text-[#008751] hover:text-white bg-[#008751]/10 hover:bg-[#008751] px-4 py-2.5 rounded-xl transition-all border border-[#008751]/30"
                >
                  <RotateCcw size={14} />
                  Voir toutes les épreuves
                </button>
                
                <a  href="https://decsup.bj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white bg-[#1e2e21] hover:bg-[#2a3f2d] px-4 py-2.5 rounded-xl transition-all border border-[#2a3f2d]"
                >
                  <ExternalLink size={14} />
                  Vérifier sur decsup.bj
                </a>
              </div>
            </div>
          )}
        </main>

        {/* ══ PIED DE PAGE ═════════════════════════════════ */}
        <footer className="border-t border-[#1e2e21] py-8">
          <div className="ligne-tricolore mx-6 mb-6 max-w-6xl md:mx-auto" />
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                ExamBénin
              </span>
              <span className="text-[#8fa895] text-sm">— Réussis ton examen national 🇧🇯</span>
            </div>
            <Link
              href="/suggestions"
              className="flex items-center gap-2 text-[#8fa895] hover:text-white text-sm transition-colors"
            >
              <MessageSquare size={14} />
              Suggestions &amp; Soutien
            </Link>
          </div>
        </footer>
      </div>

      {epreuveOuverte && (
        <ModalVisionneuse
          epreuve={epreuveOuverte}
          onFermer={() => setEpreuveOuverte(null)}
        />
      )}
    </>
  )
}