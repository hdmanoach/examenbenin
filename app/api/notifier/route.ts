// ============================================================
// API ROUTE : POST /api/notifier
// Envoie les emails via SMTP Gmail
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Transporteur SMTP Gmail ───────────────────────────────────
const transporteur = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Helper pour logs conditionnels (développement uniquement)
const log = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data || '')
  }
}

const logError = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, data || '')
  }
}

// Vérifier la config au démarrage
log('🔧 Config Nodemailer:')
log(`   GMAIL_USER: ${process.env.GMAIL_USER ? '✅ Défini' : '❌ Manquant'}`)
log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Défini (' + process.env.GMAIL_APP_PASSWORD.length + ' caractères)' : '❌ Manquant'}`)

// ── Fonction helper qui ajoute les headers CORS ──────────────
// On l'applique sur TOUTES les réponses sans exception
function repondre(body: object, status = 200) {
  const origineAutorisee = process.env.ADMIN_APP_URL || 'http://localhost:3001'
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': origineAutorisee,
      'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type, Authorization, x-api-key',
    },
  })
}

// ── Preflight OPTIONS ─────────────────────────────────────────
// IMPORTANT : doit retourner 200 et non 204
export async function OPTIONS() {
  const origineAutorisee = process.env.ADMIN_APP_URL || 'http://localhost:3001'
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origineAutorisee,
      'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type, Authorization, x-api-key',
    },
  })
}

function echapperHtml(valeur: string) {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Template HTML ─────────────────────────────────────────────
function creerEmailHTML(params: {
  type:    'epreuve' | 'filiere'
  titre:   string
  details: Record<string, string>
  siteUrl: string
}) {
  const { type, titre, details, siteUrl } = params

  const lignesDetails = Object.entries(details)
    .map(([cle, val]) => `
      <tr>
        <td style="color:#8fa895;padding:6px 0;font-size:13px;width:120px;">${echapperHtml(cle)}</td>
        <td style="color:white;padding:6px 0;font-size:13px;font-weight:600;">${echapperHtml(val)}</td>
      </tr>`)
    .join('')

  return `<!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a0f0d;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:32px 16px;">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#111a14;border:1px solid #1e2e21;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,#008751 33%,#FCD116 33% 66%,#EF2B2D 66%);"></td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0;">
                <p style="color:#008751;font-size:22px;font-weight:800;margin:0;">ExamBénin 🇧🇯</p>
                <p style="color:#8fa895;font-size:13px;margin:8px 0 0;">
                  ${type === 'epreuve'
                    ? "📄 Une nouvelle épreuve vient d'être publiée !"
                    : "🎓 Une nouvelle filière vient d'être ajoutée !"}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#0d1610;border:1px solid #1e2e21;border-radius:12px;padding:16px 20px;">
                  <tr>
                    <td colspan="2" style="padding-bottom:12px;">
                      <p style="color:white;font-size:17px;font-weight:700;margin:0;">${echapperHtml(titre)}</p>
                    </td>
                  </tr>
                  ${lignesDetails}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;">
                <a href="${siteUrl}"
                  style="display:block;background:#008751;color:white;text-align:center;
                         padding:14px;border-radius:12px;text-decoration:none;
                         font-weight:700;font-size:14px;">
                  Consulter sur ExamBénin →
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;border-top:1px solid #1e2e21;">
                <p style="color:#8fa895;font-size:11px;text-align:center;margin:0;">
                  Tu reçois cet email car tu es inscrit aux notifications ExamBénin.
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`
}

export async function POST(req: NextRequest) {
  // ── Vérifier la clé secrète ───────────────────────────────
  // Bloque toute requête qui ne vient pas de l'app admin
  const cleRecue = req.headers.get('x-api-key')
  log('📨 Requête notification reçue')
  log('   Clé reçue:', cleRecue ? '✅ ' + cleRecue.substring(0, 10) + '...' : '❌ Manquante')
  log('   Clé attendue:', process.env.API_SECRET_KEY ? '✅ ' + process.env.API_SECRET_KEY.substring(0, 10) + '...' : '❌ Manquante')
  
  if (cleRecue !== process.env.API_SECRET_KEY) {
    logError('❌ Authentification échouée - clé API non valide')
    return repondre({ message: 'Non autorisé' }, 401)
  }
  
  log('✅ Authentification réussie')

  // ── Vérifier la requête ────────────────────────────────────
  try {
    const body = await req.json()
    const { type, titre, details } = body
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    if (type !== 'epreuve' && type !== 'filiere') {
      return repondre({ succes: false, message: 'Type invalide.' }, 400)
    }
    if (typeof titre !== 'string' || !titre.trim()) {
      return repondre({ succes: false, message: 'Titre invalide.' }, 400)
    }
    if (
      !details ||
      typeof details !== 'object' ||
      Array.isArray(details) ||
      Object.values(details).some(val => typeof val !== 'string')
    ) {
      return repondre({ succes: false, message: 'Détails invalides.' }, 400)
    }

    // 1. Récupérer les abonnés actifs
    const { data: abonnes, error } = await supabase
      .from('abonnes')
      .select('email')
      .eq('actif', true)

    if (error) {
      logError('❌ Erreur Supabase:', error.message)
      logError('   Code:', error.code)
      logError('   Details:', error)
      throw new Error(error.message)
    }

    log(`📋 Abonnés trouvés: ${abonnes?.length || 0}`)
    log('   Data:', JSON.stringify(abonnes, null, 2))
    
    if (!abonnes || abonnes.length === 0) {
      log('⚠️ Aucun abonné actif trouvé - vérifier RLS et permissions Supabase')
      return repondre({ message: 'Aucun abonné actif', nbEnvoyes: 0 })
    }

    const sujet = type === 'epreuve'
      ? `📄 Nouvelle épreuve : ${titre}`
      : `🎓 Nouvelle filière : ${titre}`

    const html = creerEmailHTML({ type, titre, details, siteUrl })

    // 2. Envoyer à chaque abonné
    let nbEnvoyes = 0
    let nbErreurs = 0
    log(`📤 Envoi des emails à ${abonnes.length} abonné(s)...`)
    
    for (const abonne of abonnes) {
      try {
        log(`   → Envoi à ${abonne.email}...`)
        await transporteur.sendMail({
          from:    `"ExamBénin 🇧🇯" <${process.env.GMAIL_USER}>`,
          to:      abonne.email,
          subject: sujet,
          html,
        })
        log(`      ✅ Envoyé à ${abonne.email}`)
        nbEnvoyes++
      } catch (e) {
        nbErreurs++
        logError(`      ❌ Erreur ${abonne.email}:`, e instanceof Error ? e.message : e)
      }
    }

    log(`✅ ${nbEnvoyes} email(s) envoyé(s), ${nbErreurs} erreur(s)`)

    if (nbEnvoyes === 0) {
      return repondre({
        succes: false,
        message: 'Aucun email n\'a pu etre envoye. Verifie GMAIL_USER / GMAIL_APP_PASSWORD.',
        nbEnvoyes,
        nbErreurs,
      }, 502)
    }

    return repondre({ succes: true, nbEnvoyes, nbErreurs })

  } catch (err) {
    logError('Erreur notification:', err)
    return repondre({ succes: false, message: 'Erreur interne lors de la notification.' }, 500)
  }
}
