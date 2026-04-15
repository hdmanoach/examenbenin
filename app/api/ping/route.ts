// ============================================================
// API ROUTE : GET /api/ping
// Utilisée par le cron job pour garder Supabase actif
// Sans visite pendant 7 jours → Supabase met le projet en pause
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  // Faire une requête légère pour maintenir Supabase actif
  const { count } = await supabase
    .from('epreuves')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    statut:    'ok',
    timestamp: new Date().toISOString(),
    epreuves:  count || 0,
  })
}