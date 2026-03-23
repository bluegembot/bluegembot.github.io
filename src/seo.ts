import type { RouteLocationNormalizedLoaded } from 'vue-router'

const DEFAULT_TITLE = 'BlueGemBot | CS2 Skinport & CSFloat Listing Tracker'
const DEFAULT_DESCRIPTION =
  'BlueGemBot is a CS2 skin listing tracker for Skinport and CSFloat with Discord alerts, blue gem monitoring, and fast deal discovery.'
const SITE_URL = 'https://bluegembot.com'
const DEFAULT_IMAGE = `${SITE_URL}/BGBLogo.jpg`

type SeoRouteMeta = {
  title?: string
  description?: string
  canonical?: string
}

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value)
  })
}

const ensureLinkTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element!.setAttribute(key, value)
  })
}

export const applyRouteSeo = (route: RouteLocationNormalizedLoaded) => {
  const meta = route.meta as SeoRouteMeta
  const title = meta.title ?? DEFAULT_TITLE
  const description = meta.description ?? DEFAULT_DESCRIPTION
  const canonical = meta.canonical ?? `${SITE_URL}${route.path}`

  document.title = title

  ensureMetaTag('meta[name="description"]', { name: 'description', content: description })
  ensureMetaTag('meta[property="og:title"]', { property: 'og:title', content: title })
  ensureMetaTag('meta[property="og:description"]', { property: 'og:description', content: description })
  ensureMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonical })
  ensureMetaTag('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE })
  ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE })
  ensureLinkTag('link[rel="canonical"]', { rel: 'canonical', href: canonical })
}
