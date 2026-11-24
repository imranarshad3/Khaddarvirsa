import type { MetadataRoute } from 'next';
import { imageUrl, sitemapEntries } from '@/lib/catalog';
import { siteUrl } from '@/lib/settings';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Stored as 'YYYY-MM-DD HH:MM:SS' UTC (SQLite datetime) or ISO; a bad value is left out rather than breaking the sitemap.
const when = (v: string) => { const d = new Date(v.includes('T') ? v : v.replace(' ', 'T') + 'Z'); return isNaN(+d) ? undefined : d; };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { categories, subs, products } = (await sitemapEntries());
  const pages = (await db().prepare("SELECT slug, updated_at FROM pages WHERE body != ''").all()) as { slug: string; updated_at: string }[];
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/today-sale`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/contact` },
    ...categories.map((c) => ({ url: `${base}/main-category/${c.alias}`, changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...subs.map((s) => ({ url: `${base}/product-category/${s.alias}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...products.map((p) => {
      const img = p.img ? imageUrl(p.img, 'product') : null;
      return { url: `${base}/product/${p.alias}`, lastModified: when(p.updated_at), priority: 0.7, ...(img ? { images: [img.startsWith('/') ? base + img : img] } : {}) };
    }),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: when(p.updated_at) })),
  ];
}
