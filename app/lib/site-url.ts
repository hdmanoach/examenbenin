const FALLBACK_SITE_URL = 'https://examenbenin.vercel.app'

function normalizeUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '')
  }

  return `https://${trimmed}`.replace(/\/+$/, '')
}

function isLocalhostUrl(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)
}

export function getSiteUrl() {
  const publicSiteUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL ?? '')
  const vercelProductionUrl = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL ?? '')
  const vercelPreviewUrl = normalizeUrl(process.env.VERCEL_URL ?? '')
  const isVercelRuntime = Boolean(vercelProductionUrl || vercelPreviewUrl)

  const candidates = isVercelRuntime && publicSiteUrl && isLocalhostUrl(publicSiteUrl)
    ? [vercelProductionUrl, vercelPreviewUrl, FALLBACK_SITE_URL]
    : [publicSiteUrl, vercelProductionUrl, vercelPreviewUrl, FALLBACK_SITE_URL]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const normalized = normalizeUrl(candidate)

    if (normalized) {
      return normalized
    }
  }

  return FALLBACK_SITE_URL
}
