'use server';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { totals, unitPrice } from '@/lib/pricing';
import { imageUrl, searchProducts, type Product } from '@/lib/catalog';
import { findDiscount, OrderError, placeOrder, type OrderInput } from '@/lib/orders';

/** Current server prices and totals for the cart, so the customer never sees stale prices at checkout. */
export async function quoteCart(items: { id: number; qty: number }[], code?: string) {
  const s = (await getSettings());
  const get = db().prepare(`SELECT p.* FROM products p JOIN sub_categories s ON s.id = p.sub_category_id JOIN categories c ON c.id = s.category_id AND c.status = 1 WHERE p.id = ? AND p.hidden = 0`);
  const lines = await Promise.all((Array.isArray(items) ? items.slice(0, 100) : []).map(async (it) => {
    const p = (await get.get(Number(it.id))) as Product | undefined;
    const qty = Math.max(1, Math.min(50, Math.floor(Number(it.qty)) || 1));
    if (!p) return { id: Number(it.id), qty, available: false, price: 0, stock: null as number | null };
    return { id: p.id, qty, available: Boolean(p.in_stock), price: unitPrice(p), stock: p.stock,
      title: p.title, code: p.code, alias: p.alias, img: imageUrl(p.img, 'product', '100x100_cover') };
  }));
  const subtotal = lines.filter((l) => l.available).reduce((a, l) => a + l.price * l.qty, 0);
  const discount = (await findDiscount(code));
  return {
    lines,
    discountValid: code ? Boolean(discount) : null,
    ...totals(subtotal, { charges: s.shipping_charges, freeOver: s.free_shipping_over }, discount),
    freeShippingOver: s.free_shipping_over,
  };
}

export async function submitOrder(input: OrderInput): Promise<{ ok: true; number: string } | { ok: false; error: string }> {
  try {
    return { ok: true, number: (await placeOrder(input)) };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    console.error('placeOrder failed', e);
    return { ok: false, error: 'Sorry, we could not place your order. Please try again or contact us on WhatsApp.' };
  }
}

export async function searchSuggest(q: string) {
  if (typeof q !== 'string' || q.trim().length < 2) return [];
  return (await searchProducts(q.trim().slice(0, 60), 8)).map((p) => ({
    alias: p.alias, title: p.title, code: p.code, img: imageUrl(p.img, 'product', '100x100_cover'),
  }));
}

export async function subscribe(_: unknown, form: FormData): Promise<{ ok: boolean; message: string }> {
  const email = String(form.get('email') ?? '').trim().slice(0, 150);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please enter a valid email address.' };
  await db().prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(email);
  return { ok: true, message: 'Thank you for subscribing!' };
}
