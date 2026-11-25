'use server';
// Every action re-checks the admin session on the server: the panel layout check alone does not protect actions.
import { redirect } from 'next/navigation';
import { db, tx } from '@/lib/db';
import { endSession, requireAdmin } from '@/lib/auth';
import { saveImage } from '@/lib/uploads';
import { getSettings, saveSettings, type Settings } from '@/lib/settings';
import { applyOrderUpdate } from '@/lib/orders';
import { parseCsv } from '@/lib/csv';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const optStr = (f: FormData, k: string) => str(f, k) || null;
const int = (f: FormData, k: string) => { const v = str(f, k); return v === '' ? null : Math.round(Number(v)); };
const bool = (f: FormData, k: string) => (f.get(k) ? 1 : 0);
const lines = (f: FormData, k: string) => str(f, k).split('\n').map((l) => l.trim()).filter(Boolean);
const pipes = (f: FormData, k: string) => lines(f, k).map((l) => l.split('|').map((x) => x.trim()));
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

function fail(path: string, msg: string): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(msg)}`);
}
function isUnique(e: unknown) { return e instanceof Error && /UNIQUE/.test(e.message); }

export async function logout() {
  await endSession();
  redirect('/admin/login?out=1');
}

/* ---------------- products ---------------- */
export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const back = id ? `/admin/products/${id}` : '/admin/products/new';
  const title = str(form, 'title');
  const code = optStr(form, 'code');
  const price = int(form, 'price');
  const sale = int(form, 'sale_price');
  const stock = int(form, 'stock');
  const sub = int(form, 'sub_category_id');
  if (!title) fail(back, 'Title is required.');
  if (!price || price <= 0) fail(back, 'Price must be a positive number.');
  if (sale !== null && (sale <= 0 || sale >= price)) fail(back, 'Sale price must be lower than the price (leave empty for no sale).');
  if (stock !== null && stock < 0) fail(back, 'Stock cannot be negative.');
  if (!sub || !(await db().prepare('SELECT 1 FROM sub_categories WHERE id = ?').get(sub))) fail(back, 'Choose a collection.');
  const alias = slugify(str(form, 'alias') || `${title} ${code ?? ''}`);
  if (!alias) fail(back, 'URL alias is required.');

  let img: string | null;
  try { img = (await saveImage(form.get('image'))) ?? optStr(form, 'img'); } catch (e) { fail(back, (e as Error).message); }
  // A tracked stock of 0 means out of stock; otherwise the manual availability switch decides.
  const inStock = stock === 0 ? 0 : bool(form, 'in_stock');
  const vals = [sub, alias, title, str(form, 'description'), price, sale, img, code, inStock, stock, bool(form, 'on_sale'),
    optStr(form, 'youtube_link'), bool(form, 'hidden'), bool(form, 'premium') ? Math.max(1, Math.floor(Number(str(form, 'premium_position')) || 1)) : 0, optStr(form, 'meta_title'), optStr(form, 'meta_description')];
  let newId = id;
  try {
    if (id) {
      (await db().prepare(`UPDATE products SET sub_category_id=?, alias=?, title=?, description=?, price=?, sale_price=?, img=?, code=?, in_stock=?, stock=?,
        on_sale=?, youtube_link=?, hidden=?, premium=?, meta_title=?, meta_description=?, updated_at=datetime('now') WHERE id=?`).run(...vals, id));
    } else {
      newId = Number((await db().prepare(`INSERT INTO products (sub_category_id, alias, title, description, price, sale_price, img, code, in_stock, stock,
        on_sale, youtube_link, hidden, premium, meta_title, meta_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...vals)).lastInsertRowid);
    }
  } catch (e) {
    if (isUnique(e)) fail(back, `Another product already uses the alias "${alias}".`);
    throw e;
  }
  redirect(`/admin/products/${newId}?saved=1`);
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  await db().prepare('DELETE FROM products WHERE id = ?').run(int(form, 'id'));
  redirect('/admin/products?saved=1');
}

/** Bulk price / stock edits from the product list. */
export async function quickUpdateProducts(form: FormData) {
  await requireAdmin();
  const ids = form.getAll('ids').map(Number).filter(Number.isInteger);
  const errors: string[] = [];
  await tx(async (d) => {
    const upd = d.prepare(`UPDATE products SET price=?, sale_price=?, in_stock=?, stock=?, hidden=?, updated_at=datetime('now') WHERE id=?`);
    for (const id of ids) {
      const price = int(form, `price_${id}`), sale = int(form, `sale_${id}`), stock = int(form, `stock_${id}`);
      if (!price || price <= 0 || (sale !== null && (sale <= 0 || sale >= price)) || (stock !== null && stock < 0)) { errors.push(String(id)); continue; }
      (await upd.run(price, sale, stock === 0 ? 0 : bool(form, `instock_${id}`), stock, bool(form, `hidden_${id}`), id));
    }
  });
  const back = str(form, 'back') || '/admin/products';
  if (errors.length) fail(back, `Not saved for product IDs ${errors.join(', ')}: check price, sale price and stock.`);
  redirect(`${back}${back.includes('?') ? '&' : '?'}saved=1`);
}

const CSV_COLS = ['id', 'price', 'sale_price', 'stock', 'in_stock', 'hidden', 'on_sale'];
/** Uploads the products CSV (from Download CSV) back: updates price, sale, stock and flags of existing products. All rows or none. */
export async function importProducts(form: FormData) {
  await requireAdmin();
  const back = '/admin/products';
  const file = form.get('file');
  if (!(file instanceof File) || !file.size) fail(back, 'Choose a CSV file first.');
  if (file.size > 2_000_000) fail(back, 'That file is too big (max 2 MB).');
  const rows = parseCsv(await file.text());
  const missing = CSV_COLS.filter((c) => rows[0] && !(c in rows[0]));
  if (!rows.length || missing.length) fail(back, `The file needs these columns: ${CSV_COLS.join(', ')}. Download the CSV from this page, edit it, and upload it back.`);
  const whole = (v: string) => (v === '' ? null : /^\d+$/.test(v) ? Number(v) : NaN);
  const flag = (v: string) => (/^(1|yes|y|true)$/i.test(v) ? 1 : /^(0|no|n|false|)$/i.test(v) ? 0 : NaN);
  const errors: string[] = [];
  const updates = rows.map((r, i) => {
    const [id, price, sale, stock] = [whole(r.id), whole(r.price), whole(r.sale_price), whole(r.stock)];
    const [inStock, hidden, onSale] = [flag(r.in_stock), flag(r.hidden), flag(r.on_sale)];
    const ok = id && price && !Number.isNaN(sale) && !Number.isNaN(stock) && (sale === null || (sale > 0 && sale < price))
      && ![inStock, hidden, onSale].some(Number.isNaN);
    if (!ok) errors.push(`row ${i + 2}${r.id ? ` (id ${r.id})` : ''}`);
    return [price, sale, stock === 0 ? 0 : inStock, stock, hidden, onSale, id] as (number | null)[];
  });
  if (errors.length) fail(back, `Nothing was changed. Check price, sale price (lower than price), stock and the 1/0 columns in ${errors.slice(0, 5).join(', ')}${errors.length > 5 ? ` and ${errors.length - 5} more` : ''}.`);
  let changed = 0;
  await tx(async (d) => {
    const upd = d.prepare(`UPDATE products SET price=?, sale_price=?, in_stock=?, stock=?, hidden=?, on_sale=?, updated_at=datetime('now') WHERE id=?`);
    for (const u of updates) changed += (await upd.run(...u)).changes;
  });
  const skipped = updates.length - changed;
  redirect(`${back}?saved=${encodeURIComponent(`Updated ${changed} product${changed === 1 ? '' : 's'} from the CSV.${skipped ? ` ${skipped} row${skipped === 1 ? '' : 's'} had an id that is not in the store and ${skipped === 1 ? 'was' : 'were'} skipped.` : ''}`)}`);
}

const BULK: Record<string, string> = {
  hide: 'hidden = 1', show: 'hidden = 0',
  in: 'in_stock = CASE WHEN stock = 0 THEN 0 ELSE 1 END', out: 'in_stock = 0', // a tracked stock of 0 stays out of stock
  sale_on: 'on_sale = 1', sale_off: 'on_sale = 0', premium_off: 'premium = 0',
};

/** One action on every ticked product in the list: hide/show, stock, sale, premium, delete. */
export async function bulkProducts(form: FormData) {
  await requireAdmin();
  const raw = str(form, 'back');
  const back = raw.startsWith('/admin/') ? raw : '/admin/products';
  const ids = [...new Set(form.getAll('sel').map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  const op = str(form, 'bulk');
  if (!ids.length) fail(back, 'Tick at least one product first.');
  if (!op) fail(back, 'Choose what to do with the selected products.');
  const marks = ids.map(() => '?').join(',');
  if (op === 'delete') await db().prepare(`DELETE FROM products WHERE id IN (${marks})`).run(...ids);
  else if (op === 'premium_on') await tx(async (d) => {
    // New premium products go after the existing ones, in list order; already-premium keep their position.
    let next = Number(((await d.prepare('SELECT IFNULL(MAX(premium), 0) n FROM products').get()) as { n: number }).n);
    const upd = d.prepare(`UPDATE products SET premium = ?, updated_at = datetime('now') WHERE id = ? AND premium = 0`);
    for (const id of ids) if ((await upd.run(next + 1, id)).changes) next++;
  });
  else if (BULK[op]) await db().prepare(`UPDATE products SET ${BULK[op]}, updated_at = datetime('now') WHERE id IN (${marks})`).run(...ids);
  else fail(back, 'Unknown action.');
  redirect(`${back}${back.includes('?') ? '&' : '?'}saved=1`);
}

/* ---------------- categories & collections ---------------- */
export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const name = str(form, 'name');
  const alias = slugify(str(form, 'alias') || name);
  if (!name || !alias) fail('/admin/categories', 'Category name is required.');
  const vals = [name, alias, optStr(form, 'meta_title'), optStr(form, 'meta_description'), bool(form, 'status'), int(form, 'order_no') ?? 0];
  try {
    if (id) (await db().prepare('UPDATE categories SET name=?, alias=?, meta_title=?, meta_description=?, status=?, order_no=? WHERE id=?').run(...vals, id));
    else (await db().prepare('INSERT INTO categories (name, alias, meta_title, meta_description, status, order_no) VALUES (?,?,?,?,?,?)').run(...vals));
  } catch (e) {
    if (isUnique(e)) fail('/admin/categories', `Alias "${alias}" is already used.`);
    throw e;
  }
  redirect('/admin/categories?saved=1');
}

export async function saveSubCategory(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const back = id ? `/admin/categories/${id}` : '/admin/categories/new';
  const name = str(form, 'name');
  const alias = slugify(str(form, 'alias') || name);
  const cat = int(form, 'category_id');
  if (!name || !alias) fail(back, 'Collection name is required.');
  if (!cat || !(await db().prepare('SELECT 1 FROM categories WHERE id = ?').get(cat))) fail(back, 'Choose a main category.');
  let img: string | null;
  try { img = (await saveImage(form.get('image'))) ?? optStr(form, 'img'); } catch (e) { fail(back, (e as Error).message); }
  const vals = [cat, name, alias, optStr(form, 'description'), img, optStr(form, 'meta_title'), optStr(form, 'meta_description'),
    bool(form, 'status'), bool(form, 'featured'), int(form, 'order_no') ?? 0, int(form, 'home_order_no') ?? 0];
  try {
    if (id) (await db().prepare(`UPDATE sub_categories SET category_id=?, name=?, alias=?, description=?, img=?, meta_title=?, meta_description=?,
      status=?, featured=?, order_no=?, home_order_no=? WHERE id=?`).run(...vals, id));
    else (await db().prepare(`INSERT INTO sub_categories (category_id, name, alias, description, img, meta_title, meta_description, status, featured, order_no, home_order_no)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(...vals));
  } catch (e) {
    if (isUnique(e)) fail(back, `Alias "${alias}" is already used.`);
    throw e;
  }
  redirect(`/admin/categories?saved=1`);
}

export async function deleteSubCategory(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const n = ((await db().prepare('SELECT COUNT(*) n FROM products WHERE sub_category_id = ?').get(id)) as { n: number }).n;
  if (n) fail(`/admin/categories/${id}`, `Move or delete its ${n} products first.`);
  await db().prepare('DELETE FROM sub_categories WHERE id = ?').run(id);
  redirect('/admin/categories?saved=1');
}

/* ---------------- orders ---------------- */
export async function updateOrder(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id') ?? 0;
  const err = await applyOrderUpdate(id, { status: str(form, 'status'), admin_note: optStr(form, 'admin_note'), courier: optStr(form, 'courier'), tracking: optStr(form, 'tracking') });
  if (err) fail(err === 'Order not found.' ? '/admin/orders' : `/admin/orders/${id}`, err);
  redirect(`/admin/orders/${id}?saved=1`);
}

/* ---------------- discounts ---------------- */
export async function saveDiscount(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const code = str(form, 'code').toUpperCase();
  const type = str(form, 'type');
  const value = int(form, 'value');
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) fail('/admin/discounts', 'Code must be 3–30 letters, numbers, - or _.');
  if (type !== 'percent' && type !== 'fixed') fail('/admin/discounts', 'Choose percent or fixed.');
  if (!value || value <= 0 || (type === 'percent' && value > 100)) fail('/admin/discounts', 'Enter a valid discount value.');
  const vals = [code, type, value, int(form, 'min_subtotal') ?? 0, bool(form, 'active'), optStr(form, 'expires_at')];
  try {
    if (id) (await db().prepare('UPDATE discounts SET code=?, type=?, value=?, min_subtotal=?, active=?, expires_at=? WHERE id=?').run(...vals, id));
    else (await db().prepare('INSERT INTO discounts (code, type, value, min_subtotal, active, expires_at) VALUES (?,?,?,?,?,?)').run(...vals));
  } catch (e) {
    if (isUnique(e)) fail('/admin/discounts', `Code ${code} already exists.`);
    throw e;
  }
  redirect('/admin/discounts?saved=1');
}

export async function deleteDiscount(form: FormData) {
  await requireAdmin();
  await db().prepare('DELETE FROM discounts WHERE id = ?').run(int(form, 'id'));
  redirect('/admin/discounts?saved=1');
}

/* ---------------- settings, homepage, pages ---------------- */
export async function saveStoreSettings(form: FormData) {
  await requireAdmin();
  const patch: Partial<Settings> = {
    store_name: str(form, 'store_name') || 'Khaddar Virsa',
    top_bar_text: lines(form, 'top_bar_text'),
    shipping_charges: Math.max(0, int(form, 'shipping_charges') ?? 0),
    free_shipping_over: Math.max(0, int(form, 'free_shipping_over') ?? 0),
    contact: { address: lines(form, 'address'), email: lines(form, 'email'), phone: lines(form, 'phone') },
    whatsapp_number: str(form, 'whatsapp_number'),
    social: pipes(form, 'social').filter((p) => p.length >= 3 && /^https?:\/\//.test(p[2])).map(([key, name, link]) => ({ key: key.toLowerCase(), name, link })),
    bank_details: pipes(form, 'bank_details').filter((p) => p.length >= 4).map(([bank, account_title, account_number, iban]) => ({ bank, account_title, account_number, iban })),
    bank_note: str(form, 'bank_note'),
    seo_title: str(form, 'seo_title'),
    seo_description: str(form, 'seo_description'),
  };
  await saveSettings(patch);
  redirect('/admin/settings?saved=1');
}

export async function saveSalePage(form: FormData) {
  await requireAdmin();
  const color = str(form, 'sale_color');
  const ends = str(form, 'sale_ends_at'); // datetime-local, entered in Pakistan time
  let banner = form.get('remove_banner') ? '' : str(form, 'sale_banner');
  try { banner = (await saveImage(form.get('banner'))) ?? banner; } catch (e) { fail('/admin/sale', (e as Error).message); }
  await saveSettings({
    sale_enabled: !!form.get('sale_enabled'),
    sale_title: str(form, 'sale_title') || 'Sale',
    sale_color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#B70000',
    sale_headline: str(form, 'sale_headline').slice(0, 120),
    sale_text: str(form, 'sale_text').slice(0, 400),
    sale_banner: banner,
    sale_ends_at: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(ends) ? `${ends}:00+05:00` : '',
  });
  redirect('/admin/sale?saved=1');
}

export async function saveHomepage(form: FormData) {
  await requireAdmin();
  const sliders = pipes(form, 'sliders').filter((p) => p[0]).map(([img, link = '']) => ({ img, link }));
  let added: string | null;
  try { added = await saveImage(form.get('new_slide')); } catch (e) { fail('/admin/homepage', (e as Error).message); }
  if (added) sliders.push({ img: added, link: str(form, 'new_slide_link') });
  await saveSettings({ sliders });
  redirect('/admin/homepage?saved=1');
}

export async function savePage(form: FormData) {
  await requireAdmin();
  const slug = slugify(str(form, 'slug'));
  const title = str(form, 'title');
  if (!slug || !title) fail('/admin/pages', 'Page slug and title are required.');
  const reserved = ['admin', 'product', 'product-category', 'main-category', 'today-sale', 'cart-detail', 'checkout', 'order', 'search', 'contact', 'uploads', 'brand'];
  if (reserved.includes(slug)) fail('/admin/pages', `"${slug}" is a reserved URL.`);
  (await db().prepare(`INSERT INTO pages (slug, title, body, meta_description, updated_at) VALUES (?,?,?,?,datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET title=excluded.title, body=excluded.body, meta_description=excluded.meta_description, updated_at=excluded.updated_at`)
    .run(slug, title, str(form, 'body'), optStr(form, 'meta_description')));
  const menu = (await getSettings()).menu_pages.filter((x) => x !== slug);
  await saveSettings({ menu_pages: form.get('in_menu') ? [...menu, slug] : menu });
  redirect(`/admin/pages?saved=1&edit=${slug}`);
}

export async function deletePage(form: FormData) {
  await requireAdmin();
  const slug = str(form, 'slug');
  await db().prepare('DELETE FROM pages WHERE slug = ?').run(slug);
  await saveSettings({ menu_pages: (await getSettings()).menu_pages.filter((x) => x !== slug) });
  redirect('/admin/pages?saved=1');
}

export async function deleteSubscriber(form: FormData) {
  await requireAdmin();
  await db().prepare('DELETE FROM subscribers WHERE id = ?').run(int(form, 'id'));
  redirect('/admin/subscribers?saved=1');
}

/** Copies a product as a hidden draft, so a similar article can be listed without retyping. */
// Row buttons inside the list form: React rewrites a formAction button's name, so the id travels as a bound arg.
export async function deleteProductRow(id: number) { const f = new FormData(); f.set('id', String(id)); return deleteProduct(f); }
export async function duplicateProductRow(id: number) { const f = new FormData(); f.set('id', String(id)); return duplicateProduct(f); }

export async function duplicateProduct(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const p = (await db().prepare('SELECT * FROM products WHERE id = ?').get(id)) as Record<string, string | number | null> | undefined;
  if (!p) fail('/admin/products', 'Product not found.');
  let alias = `${p.alias}-copy`;
  for (let n = 2; (await db().prepare('SELECT 1 FROM products WHERE alias = ?').get(alias)); n++) alias = `${p.alias}-copy-${n}`;
  const newId = Number((await db().prepare(`INSERT INTO products (sub_category_id, alias, title, description, price, sale_price, img, code, in_stock, stock,
    on_sale, youtube_link, hidden, meta_title, meta_description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`)
    .run(p.sub_category_id, alias, `${p.title} (copy)`, p.description, p.price, p.sale_price, p.img, null, p.in_stock, p.stock,
      p.on_sale, p.youtube_link, p.meta_title, p.meta_description)).lastInsertRowid);
  redirect(`/admin/products/${newId}?saved=1`);
}
