// ============================================================
// BASE DE DONNÉES — connexion Supabase
// Filières dynamiques + compteur de vues + abonnés
// ============================================================

import { createClient } from '@supabase/supabase-js'

// ── Client Supabase ──────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export { supabase }

// ── Types ────────────────────────────────────────────────────
export type Session  = 'pratique' | 'theorique'
export type TypeBloc = 'epreuve' | 'revision'

// Filière dynamique (depuis Supabase)
export interface Filiere {
  id:          string
  code:        string        // ex: 'ASSRI', 'SIL', 'TSRI'
  nom:         string        // ex: 'Administration Systèmes...'
  description: string | null
  actif:       boolean
  created_at:  string
}

// Épreuve
export interface Epreuve {
  id:           string
  titre:        string
  filiere:      string       // code de la filière (ex: 'ASSRI')
  session:      Session
  annee:        number
  matiere:      string
  type:         TypeBloc
  url_fichier:  string
  type_fichier: 'pdf' | 'image'
  description:  string | null
  vues:         number
  created_at:   string
}

// Abonné aux notifications
export interface Abonne {
  id:         string
  email:      string
  actif:      boolean
  created_at: string
}

// ── Années disponibles (décroissant : 2026 → 2017) ──────────
export const ANNEES_DISPONIBLES = [2026,2025,2024,2023,2022,2021,2020,2019,2018,2017]

// ── FILIÈRES ─────────────────────────────────────────────────

/** Récupérer toutes les filières actives depuis Supabase */
export async function obtenirFilieres(): Promise<Filiere[]> {
  const { data, error } = await supabase
    .from('filieres')
    .select('*')
    .eq('actif', true)
    .order('code')

  if (error) {
    console.error('Erreur chargement filières:', error.message)
    return []
  }
  return data as Filiere[]
}

/** Ajouter une nouvelle filière (depuis l'admin) */
export async function ajouterFiliere(params: {
  code:         string
  nom:          string
  description?: string
}): Promise<{ succes: boolean; message: string }> {
  const { error } = await supabase
    .from('filieres')
    .insert({
      code:        params.code.toUpperCase().trim(),
      nom:         params.nom.trim(),
      description: params.description || null,
    })

  if (error) return { succes: false, message: error.message }
  return { succes: true, message: 'Filière ajoutée avec succès' }
}

/** Supprimer une filière (depuis l'admin) */
export async function supprimerFiliere(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('filieres')
    .delete()
    .eq('id', id)

  return !error
}

// ── ÉPREUVES ─────────────────────────────────────────────────

/** Récupérer toutes les épreuves — triées par année décroissante */
export async function obtenirEpreuves(): Promise<Epreuve[]> {
  const { data, error } = await supabase
    .from('epreuves')
    .select('*')
    .order('annee',      { ascending: false })  // 2026 → 2025 → 2024...
    .order('created_at', { ascending: false })  // plus récent en premier pour la même année

  if (error) {
    console.error('Erreur chargement épreuves:', error.message)
    return []
  }
  return data as Epreuve[]
}

/** Filtrer les épreuves selon les critères — triées par année décroissante */
export async function filtrerEpreuves(params: {
  filiere?: string | null
  session?: Session | null
  annee?:   number  | null
  type?:    TypeBloc | null
}): Promise<Epreuve[]> {
  let query = supabase.from('epreuves').select('*')

  // Appliquer uniquement les filtres qui ont une valeur
  if (params.type)    query = query.eq('type',    params.type)
  if (params.filiere) query = query.eq('filiere', params.filiere)
  if (params.session) query = query.eq('session', params.session)
  if (params.annee)   query = query.eq('annee',   params.annee)

  const { data, error } = await query
    .order('annee',      { ascending: false })  // 2026 avant 2025 avant 2024...
    .order('created_at', { ascending: false })  // plus récent en premier pour la même année

  if (error) {
    console.error('Erreur filtrage:', error.message)
    return []
  }
  return data as Epreuve[]
}

/** Incrémenter le compteur de vues d'une épreuve */
export async function incrementerVues(id: string): Promise<void> {
  await supabase.rpc('incrementer_vues', { epreuve_id: id })
}

// ── ABONNÉS ──────────────────────────────────────────────────

/** Inscrire un email aux notifications */
export async function inscrireEmail(email: string): Promise<{
  succes:       boolean
  message:      string
  dejainscrit?: boolean
}> {
  // Vérifier si déjà inscrit
  const { data: existant } = await supabase
    .from('abonnes')
    .select('id, actif')
    .eq('email', email)
    .single()

  if (existant) {
    if (existant.actif) {
      return { succes: false, message: 'Cet email est déjà inscrit.', dejainscrit: true }
    }
    // Réactiver si désabonné
    await supabase.from('abonnes').update({ actif: true }).eq('id', existant.id)
    return { succes: true, message: 'Inscription réactivée avec succès !' }
  }

  const { error } = await supabase
    .from('abonnes')
    .insert({ email: email.toLowerCase().trim() })

  if (error) return { succes: false, message: "Erreur lors de l'inscription." }
  return { succes: true, message: 'Inscription réussie ! Tu recevras les notifications.' }
}

/** Récupérer tous les abonnés actifs (pour l'admin) */
export async function obtenirAbonnes(): Promise<Abonne[]> {
  const { data, error } = await supabase
    .from('abonnes')
    .select('*')
    .eq('actif', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Abonne[]
}

// ── SUGGESTIONS ──────────────────────────────────────────────

/** Envoyer une suggestion depuis le site public */
export async function envoyerSuggestion(params: {
  nom:     string
  email?:  string
  message: string
}): Promise<boolean> {
  const { error } = await supabase
    .from('suggestions')
    .insert({
      nom:     params.nom.trim(),
      email:   params.email?.trim() || null,
      message: params.message.trim(),
    })

  return !error
}