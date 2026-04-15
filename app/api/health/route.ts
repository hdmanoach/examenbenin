import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function json(body: object, status = 200) {
  return NextResponse.json(body, { status })
}

export async function GET(req: NextRequest) {
  const expectedApiKey = process.env.API_SECRET_KEY
  const providedApiKey = req.headers.get('x-api-key')

  if (expectedApiKey && providedApiKey !== expectedApiKey) {
    return json({ ok: false, message: 'Non autorise' }, 401)
  }

  const includeSmtpCheck = req.nextUrl.searchParams.get('smtp') === '1'

  const checks = {
    env: {
      ok: true,
      missing: [] as string[],
    },
    database: {
      ok: false,
      message: '',
      epreuves: 0,
    },
    smtp: {
      ok: !includeSmtpCheck,
      message: includeSmtpCheck ? '' : 'Verification ignoree',
    },
  }

  const requiredEnv = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD',
  ]

  checks.env.missing = requiredEnv.filter((key) => !process.env[key])
  checks.env.ok = checks.env.missing.length === 0

  try {
    const { count, error } = await supabase
      .from('epreuves')
      .select('*', { count: 'exact', head: true })

    if (error) {
      checks.database.ok = false
      checks.database.message = error.message
    } else {
      checks.database.ok = true
      checks.database.epreuves = count || 0
      checks.database.message = 'Connexion Supabase OK'
    }
  } catch (error) {
    checks.database.ok = false
    checks.database.message = error instanceof Error ? error.message : 'Erreur Supabase inconnue'
  }

  if (includeSmtpCheck) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })

      await transporter.verify()
      checks.smtp.ok = true
      checks.smtp.message = 'SMTP Gmail OK'
    } catch (error) {
      checks.smtp.ok = false
      checks.smtp.message = error instanceof Error ? error.message : 'Erreur SMTP inconnue'
    }
  }

  const ok = checks.env.ok && checks.database.ok && checks.smtp.ok

  return json(
    {
      ok,
      service: 'epreuves-bj',
      timestamp: new Date().toISOString(),
      checks,
    },
    ok ? 200 : 503
  )
}
