import nodemailer from 'nodemailer'

type AlertParams = {
  subject: string
  summary: string
  details?: Record<string, string | number | boolean | null | undefined>
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Erreur inconnue'
}

export async function sendAdminAlert(params: AlertParams) {
  const adminEmail = process.env.ALERT_EMAIL
  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!adminEmail || !gmailUser || !gmailPassword) {
    return { sent: false, reason: 'missing-config' as const }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })

  const rows = Object.entries(params.details || {})
    .map(([key, value]) => {
      const safeKey = escapeHtml(key)
      const safeValue = escapeHtml(String(value ?? ''))

      return `
        <tr>
          <td style="padding:8px 12px;border:1px solid #d9e2ec;font-weight:600;background:#f8fafc;">${safeKey}</td>
          <td style="padding:8px 12px;border:1px solid #d9e2ec;">${safeValue}</td>
        </tr>
      `
    })
    .join('')

  const html = `
    <html>
      <body style="font-family:Arial,sans-serif;background:#f4f7fb;padding:24px;color:#102a43;">
        <div style="max-width:640px;margin:0 auto;background:white;border:1px solid #d9e2ec;border-radius:12px;overflow:hidden;">
          <div style="padding:20px 24px;background:#7f1d1d;color:white;">
            <h1 style="margin:0;font-size:20px;">Alerte ExamBenin</h1>
          </div>
          <div style="padding:24px;">
            <p style="margin-top:0;font-size:15px;">${escapeHtml(params.summary)}</p>
            ${rows ? `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>` : ''}
            <p style="margin-bottom:0;margin-top:24px;font-size:12px;color:#486581;">
              Envoye automatiquement le ${escapeHtml(new Date().toISOString())}
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: `"ExamBenin Monitoring" <${gmailUser}>`,
    to: adminEmail,
    subject: params.subject,
    html,
  })

  return { sent: true as const }
}
