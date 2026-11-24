import { createClient, type Client, type InValue, type ResultSet } from '@libsql/client';
import fs from 'node:fs';
import path from 'node:path';

const LOCAL_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'store.db');
// On Vercel the Turso integration sets TURSO_DATABASE_URL and TURSO_AUTH_TOKEN; without them the local SQLite file is used.
const DB_URL = process.env.TURSO_DATABASE_URL || `file:${LOCAL_PATH}`;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, alias TEXT NOT NULL UNIQUE,
  meta_title TEXT, meta_description TEXT, status INTEGER NOT NULL DEFAULT 1, order_no INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sub_categories (
  id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL, alias TEXT NOT NULL UNIQUE, description TEXT, img TEXT,
  meta_title TEXT, meta_description TEXT,
  status INTEGER NOT NULL DEFAULT 1,      -- 1 = shown in navigation
  featured INTEGER NOT NULL DEFAULT 0,    -- 1 = shown on the homepage
  order_no INTEGER NOT NULL DEFAULT 0, home_order_no INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, sub_category_id INTEGER NOT NULL REFERENCES sub_categories(id),
  alias TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL, sale_price INTEGER,          -- whole rupees
  img TEXT, code TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1,
  stock INTEGER,                                      -- NULL = quantity not tracked
  on_sale INTEGER NOT NULL DEFAULT 0, youtube_link TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  premium INTEGER NOT NULL DEFAULT 0,               -- 1 = shown first, in the Premium section of its category
  meta_title TEXT, meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS products_sub ON products(sub_category_id);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, city TEXT NOT NULL, address TEXT NOT NULL, remarks TEXT,
  payment_method TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
  discount_code TEXT, shipping INTEGER NOT NULL, total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER, title TEXT NOT NULL, code TEXT, img TEXT,
  unit_price INTEGER NOT NULL, qty INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS discounts (
  id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed')), value INTEGER NOT NULL,
  min_subtotal INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, expires_at TEXT,
  used_count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
  meta_description TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sub_categories_cat ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS orders_phone ON orders(phone);
`;

type Runner = { execute: Client['execute'] };
const toRows = (rs: ResultSet) => rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, r[i]])));

/** Same shape as better-sqlite3's prepare(), but every call returns a promise. */
function statement(conn: () => Promise<Runner>, sql: string) {
  const exec = async (args: InValue[]) => (await conn()).execute({ sql, args });
  return {
    all: async (...args: InValue[]): Promise<unknown[]> => toRows(await exec(args)),
    get: async (...args: InValue[]): Promise<unknown> => toRows(await exec(args))[0],
    run: async (...args: InValue[]) => {
      const rs = await exec(args);
      return { lastInsertRowid: Number(rs.lastInsertRowid ?? 0), changes: rs.rowsAffected };
    },
  };
}
export type Db = { prepare: (sql: string) => ReturnType<typeof statement> };

const g = globalThis as unknown as { __db?: Promise<Client> };

async function open() {
  if (!process.env.TURSO_DATABASE_URL) fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
  const c = createClient({ url: DB_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  await c.executeMultiple(SCHEMA);
  // Databases created before the premium flag existed get the column once.
  if (!(await c.execute('PRAGMA table_info(products)')).rows.some((r) => r.name === 'premium'))
    await c.execute('ALTER TABLE products ADD COLUMN premium INTEGER NOT NULL DEFAULT 0');
  if (!Number((await c.execute('SELECT COUNT(*) n FROM categories')).rows[0].n)) await seed(c);
  return c;
}
const client = () => (g.__db ??= open().catch((e) => { g.__db = undefined; throw e; }));

export function db(): Db {
  return { prepare: (sql) => statement(client, sql) };
}

/** Runs fn in one write transaction: everything commits together or nothing does (also when fn throws a redirect). */
export async function tx<T>(fn: (d: Db) => Promise<T>): Promise<T> {
  const t = await (await client()).transaction('write');
  try {
    const out = await fn({ prepare: (sql) => statement(async () => t, sql) });
    await t.commit();
    return out;
  } catch (e) {
    await t.rollback().catch(() => {});
    throw e;
  } finally {
    t.close();
  }
}

/* ---------- first-run seed from the data captured from the reference site ---------- */

const REF = path.join(process.cwd(), 'data', 'reference');
const readRef = (f: string) => JSON.parse(fs.readFileSync(path.join(REF, f), 'utf8'));

type RefSub = {
  sub_cat_id: number; sub_cat: string; alias: string; meta_title: string | null; meta_description: string | null;
  des: string | null; img: string | null; status: number; featured: number; order_no: number; home_order_no: number;
};
type RefProduct = {
  p_id: number; alias: string; p_title: string; p_des: string | null; p_price: string; p_sale: string | null;
  p_img: string | null; p_code: string | null; status: number; on_sale_page: number; youtube_link: string | null;
  created_at: string; updated_at: string;
};

async function seed(c: Client) {
  if (!fs.existsSync(path.join(REF, 'get_navigation.json'))) return;
  const nav: { cat_id: number; cat_name: string; alias: string; meta_title: string; meta_description: string; status: number; order_no: number; sub_cat: RefSub[] }[] =
    readRef('get_navigation.json').nave;
  const s = readRef('settings.json').data;

  const batch: { sql: string; args: InValue[] }[] = [];
  const prep = (sql: string) => ({ run: (...args: InValue[]) => { batch.push({ sql, args }); } });
  const insCat = prep('INSERT INTO categories (id,name,alias,meta_title,meta_description,status,order_no) VALUES (?,?,?,?,?,?,?)');
  const insSub = prep(`INSERT INTO sub_categories (id,category_id,name,alias,description,img,meta_title,meta_description,status,featured,order_no,home_order_no)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insProd = prep(`INSERT INTO products (id,sub_category_id,alias,title,description,price,sale_price,img,code,in_stock,on_sale,youtube_link,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const setS = prep('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)');

  {
    for (const c of nav) {
      insCat.run(c.cat_id, c.cat_name, c.alias, c.meta_title, c.meta_description, c.status ?? 1, c.order_no ?? 0);
      for (const sc of c.sub_cat)
        insSub.run(sc.sub_cat_id, c.cat_id, sc.sub_cat, sc.alias, sc.des, sc.img, sc.meta_title, sc.meta_description,
          sc.status ?? 0, sc.featured ?? 0, sc.order_no ?? 0, sc.home_order_no ?? 0);
      const file = path.join(REF, `${c.alias}.json`);
      if (!fs.existsSync(file)) continue;
      for (const group of JSON.parse(fs.readFileSync(file, 'utf8')).cat_products as { sub_cat_id: number; prod: RefProduct[] }[])
        for (const p of group.prod) {
          const price = Number(p.p_price);
          const sale = p.p_sale ? Number(p.p_sale) : null;
          insProd.run(p.p_id, group.sub_cat_id, p.alias, p.p_title, p.p_des ?? '', price,
            sale && sale < price ? sale : null, p.p_img, p.p_code,
            p.status === 3 ? 0 : 1, // reference: 3 = out of stock; every other status is listed as buyable
            p.on_sale_page ? 1 : 0, p.youtube_link, p.created_at, p.updated_at ?? p.created_at);
        }
    }
    const settings: Record<string, unknown> = {
      store_name: 'Khaddar Virsa',
      top_bar_text: ['Cash on Delivery across Pakistan', `Free delivery on orders over Rs ${Number(s.shipping_fee_over).toLocaleString()}`],
      sale_title: s.today_sale_title,
      sale_color: '#' + s.today_sale_color,
      shipping_charges: s.shipping_charges,
      free_shipping_over: s.shipping_fee_over,
      // Brand contact from khaddarvirsa.store; the reference store's address, socials and bank accounts are not reused.
      contact: { address: [], email: ['khaddarvirsa1@gmail.com'], phone: ['+92 342 4307737'] },
      whatsapp_number: '923424307737',
      social: [],
      bank_details: [],
      bank_note: '',
      sliders: [], // the reference banners carry the old brand's logo; add new ones in Admin → Homepage
      seo_title: "Khaddar Virsa · Premium Men's Khaddar Suits",
      seo_description: 'Khaddar Virsa: premium Kamalia khaddar suit fabric for men. Cash on Delivery across Pakistan.',
    };
    for (const [k, v] of Object.entries(settings)) setS.run(k, JSON.stringify(v));

    const insPage = prep('INSERT INTO pages (slug,title,body) VALUES (?,?,?)');
    for (const [slug, title] of [
      ['about-us', 'About Us'], ['faq', 'FAQ'], ['return-policy', 'Return Policy'], ['terms', 'Terms & Conditions'],
      ['privacy-policy', 'Privacy Policy'], ['locations', 'Our Outlets'],
    ]) insPage.run(slug, title, '');
  }
  await c.batch(batch, 'write');
}
