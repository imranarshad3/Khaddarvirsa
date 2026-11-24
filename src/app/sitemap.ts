import type { MetadataRoute } from 'next';
import { sitemapEntries } from '@/lib/catalog';
import { siteUrl } from '@/lib/settings';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
    ...products.map((p) => ({ url: `${base}/product/${p.alias}`, lastModified: new Date(p.updated_at.replace(' ', 'T') + 'Z'), priority: 0.7 })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updated_at.replace(' ', 'T') + 'Z') })),
  ];
}
