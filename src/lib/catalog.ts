import 'server-only';
import { cache } from 'react';
import { db } from './db';
import { searchWords } from './search';

export type Category = { id: number; name: string; alias: string; meta_title: string | null; meta_description: string | null; status: number; order_no: number };
export type SubCategory = {
  id: number; category_id: number; name: string; alias: string; description: string | null; img: string | null;
  meta_title: string | null; meta_description: string | null; status: number; featured: number; order_no: number; home_order_no: number;
};
export type Product = {
  id: number; sub_category_id: number; alias: string; title: string; description: string; price: number; sale_price: number | null;
  img: string | null; code: string | null; in_stock: number; stock: number | null; on_sale: number; youtube_link: string | null;
  hidden: number; premium: number; meta_title: string | null; meta_description: string | null; created_at: string; updated_at: string;
};
export type ProductRow = Product & { sub_name: string; sub_alias: string; cat_name: string; cat_alias: string };

const IMAGE_BASE = (process.env.REFERENCE_IMAGE_BASE || 'https://kamaliakhaddar.pk/image/upload').replace(/\/$/, '');

/** Seeded rows hold a bare file name served by the reference image host; uploaded images hold a /uploads/... path. */
export function imageUrl(img: string | null | undefined, folder: 'product' | 'sub_cat', size?: string) {
  if (!img) return '/brand/favicon.svg';
  if (img.startsWith('/') || img.startsWith('http')) return img;
  return `${IMAGE_BASE}/${folder}/${img}${size ? `?p=${size}` : ''}`;
}

const PRODUCT_SELECT = `SELECT p.*, s.name sub_name, s.alias sub_alias, c.name cat_name, c.alias cat_alias
  FROM products p JOIN sub_categories s ON s.id = p.sub_category_id JOIN categories c ON c.id = s.category_id AND c.status = 1`; // a category switched off in admin hides its products everywhere in the shop
// Same rule as unitPrice() in pricing.ts: a sale price counts only when it is below the price.
const PRICE = 'CASE WHEN p.sale_price > 0 AND p.sale_price < p.price THEN p.sale_price ELSE p.price END';
// Shop default: cheapest first (in-stock pieces before sold-out ones), newest first among equal prices.
const AVAILABLE_FIRST = `p.in_stock DESC, ${PRICE} ASC, p.id DESC`;
// Category listings: products marked Premium in admin come before everything else.
const PREMIUM_FIRST = `p.premium DESC, ${AVAILABLE_FIRST}`;

// cache(): header, footer and pages share one navigation read per request.
export const navigation = cache(async () => {
  const [cats, subs] = (await Promise.all([
    db().prepare('SELECT * FROM categories WHERE status = 1 ORDER BY order_no, id').all(),
    db().prepare('SELECT * FROM sub_categories WHERE status = 1 ORDER BY order_no, id').all(),
  ])) as [Category[], SubCategory[]];
  return cats.map((c) => ({ ...c, subs: subs.filter((s) => s.category_id === c.id) }));
});

/** First in-stock product photos of a category, for homepage banners. */
export async function categoryPhotos(categoryId: number, limit = 2) {
  const rows = (await db().prepare(`SELECT p.img FROM products p JOIN sub_categories s ON s.id = p.sub_category_id
    WHERE s.category_id = ? AND p.hidden = 0 AND p.in_stock = 1 AND p.img IS NOT NULL AND p.img != '' ORDER BY ${AVAILABLE_FIRST} LIMIT ?`)
    .all(categoryId, limit)) as { img: string }[];
  return rows.map((r) => r.img);
}

export async function categoryByAlias(alias: string) {
  return (await db().prepare('SELECT * FROM categories WHERE alias = ? AND status = 1').get(alias)) as Category | undefined;
}

export async function subCategoryByAlias(alias: string) {
  return (await db().prepare(`SELECT s.*, c.name cat_name, c.alias cat_alias FROM sub_categories s JOIN categories c ON c.id = s.category_id
    WHERE s.alias = ? AND c.status = 1`).get(alias)) as (SubCategory & { cat_name: string; cat_alias: string }) | undefined;
}

/** Main category page: every sub-category that has visible products, grouped like the reference. */
export async function categorySections(categoryId: number) {
  const subs = (await db().prepare('SELECT * FROM sub_categories WHERE category_id = ? ORDER BY order_no, id').all(categoryId)) as SubCategory[];
  const prods = (await db().prepare(`${PRODUCT_SELECT} WHERE s.category_id = ? AND p.hidden = 0 ORDER BY ${PREMIUM_FIRST}`).all(categoryId)) as ProductRow[];
  return {
    premium: prods.filter((p) => p.premium === 1),
    sections: subs.map((s) => ({ sub: s, products: prods.filter((p) => p.sub_category_id === s.id) })).filter((x) => x.products.length),
  };
}

export type Sort = 'price-asc' | 'latest' | 'price-desc' | 'discount';
const SORTS: Record<Sort, string> = {
  'price-asc': PREMIUM_FIRST,
  latest: 'p.in_stock DESC, p.id DESC',
  'price-desc': `p.in_stock DESC, ${PRICE} DESC, p.id DESC`,
  discount: `p.in_stock DESC, (1.0 - ${PRICE} * 1.0 / p.price) DESC`,
};

export async function subCategoryProducts(subId: number, sort: Sort = 'price-asc', inStockOnly = false) {
  return (await db().prepare(`${PRODUCT_SELECT} WHERE p.sub_category_id = ? AND p.hidden = 0 ${inStockOnly ? 'AND p.in_stock = 1' : ''}
    ORDER BY ${SORTS[sort] ?? PREMIUM_FIRST}`).all(subId)) as ProductRow[];
}

export async function productByAlias(alias: string) {
  return (await db().prepare(`${PRODUCT_SELECT} WHERE p.alias = ? AND p.hidden = 0`).get(alias)) as ProductRow | undefined;
}

export async function relatedProducts(p: Product, limit = 8) {
  return (await db().prepare(`${PRODUCT_SELECT} WHERE p.sub_category_id = ? AND p.id != ? AND p.hidden = 0 ORDER BY ${AVAILABLE_FIRST} LIMIT ?`)
    .all(p.sub_category_id, p.id, limit)) as ProductRow[];
}

export async function saleProducts() {
  return (await db().prepare(`${PRODUCT_SELECT} WHERE p.on_sale = 1 AND p.hidden = 0 ORDER BY ${AVAILABLE_FIRST}`).all()) as ProductRow[];
}

/**
 * Products whose title, code (with or without "-"), sub-category or category contain every word.
 * If nothing matches all words, falls back to products matching the most words (partial: true).
 */
export async function searchProducts(q: string, limit = 60): Promise<{ products: ProductRow[]; partial: boolean }> {
  const words = searchWords(q);
  if (!words.length) return { products: [], partial: false };
  const hay = `LOWER(p.title || ' ' || REPLACE(IFNULL(p.code, ''), '-', ' ') || ' ' || REPLACE(IFNULL(p.code, ''), '-', '') || ' ' || s.name || ' ' || c.name)`;
  const likes = words.map(() => `(${hay} LIKE ?)`);
  const args = words.map((w) => `%${w}%`);
  const all = (await db().prepare(`${PRODUCT_SELECT} WHERE p.hidden = 0 AND ${likes.join(' AND ')} ORDER BY ${AVAILABLE_FIRST} LIMIT ?`)
    .all(...args, limit)) as ProductRow[];
  if (all.length || words.length < 2) return { products: all, partial: false };
  const some = (await db().prepare(`${PRODUCT_SELECT} WHERE p.hidden = 0 AND (${likes.join(' OR ')}) ORDER BY (${likes.join(' + ')}) DESC, ${AVAILABLE_FIRST} LIMIT ?`)
    .all(...args, ...args, limit)) as ProductRow[];
  return { products: some, partial: some.length > 0 };
}

export async function productsByIds(ids: number[]) {
  const clean = [...new Set(ids.filter((n) => Number.isInteger(n) && n > 0))].slice(0, 100);
  if (!clean.length) return [];
  return (await db().prepare(`${PRODUCT_SELECT} WHERE p.hidden = 0 AND p.id IN (${clean.map(() => '?').join(',')}) ORDER BY ${AVAILABLE_FIRST}`).all(...clean)) as ProductRow[];
}

export async function homeSections(perSection = 8) {
  const subs = (await db().prepare('SELECT * FROM sub_categories WHERE featured = 1 ORDER BY home_order_no, order_no').all()) as SubCategory[];
  const q = db().prepare(`${PRODUCT_SELECT} WHERE p.sub_category_id = ? AND p.hidden = 0 ORDER BY ${PREMIUM_FIRST} LIMIT ?`);
  const sections = await Promise.all(subs.map(async (s) => ({ sub: s, products: (await q.all(s.id, perSection)) as ProductRow[] })));
  return sections.filter((x) => x.products.length);
}

export async function sitemapEntries() {
  const d = db();
  return {
    categories: (await d.prepare('SELECT alias FROM categories WHERE status = 1').all()) as { alias: string }[],
    subs: (await d.prepare('SELECT s.alias FROM sub_categories s JOIN categories c ON c.id = s.category_id AND c.status = 1').all()) as { alias: string }[],
    products: (await d.prepare(`SELECT p.alias, p.img, p.updated_at FROM products p JOIN sub_categories s ON s.id = p.sub_category_id JOIN categories c ON c.id = s.category_id AND c.status = 1 WHERE p.hidden = 0`).all()) as { alias: string; img: string | null; updated_at: string }[],
  };
}
