import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'

export const SITE = 'https://www.khaddarvirsa.store'
const STATIC_PATHS = ['/', '/shop', '/collections', '/our-story', '/khaddar-guide', '/contact', '/track-order']
type Entry = { path: string; lastmod?: string }

const escapeXml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!)

export function sitemapXml(products: { slug: string; updated_at?: string | null }[]) {
  const entries: Entry[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...products.filter((p) => p.slug).map((p) => ({ path: `/product/${encodeURIComponent(p.slug)}`, lastmod: p.updated_at?.slice(0, 10) })),
  ]
  const urls = entries.map((e) => `  <url><loc>${escapeXml(SITE + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  let products: { slug: string; updated_at: string | null }[] = []
  // Published products are public, so the browser's publishable key is enough; no service role needed.
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data } = await db.from('products').select('slug,updated_at').eq('status', 'published').order('updated_at', { ascending: false }).limit(5000)
    products = data ?? []
  }
  // Static pages still ship if the database is unreachable.
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.end(sitemapXml(products))
}
