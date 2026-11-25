import 'server-only';
import crypto from 'node:crypto';
import { db, tx, type Db } from './db';
import { getSettings } from './settings';
import { totals, unitPrice, type Discount } from './pricing';
import { imageUrl, type Product } from './catalog';

export const PAYMENT_METHODS = { cod: 'Cash on Delivery', bank: 'Direct Bank Transfer' } as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export type OrderInput = {
  name: string; phone: string; email?: string; city: string; address: string; remarks?: string;
  payment_method: string; discount_code?: string; items: { id: number; qty: number }[];
};

export class OrderError extends Error {}

/** Pakistani mobile: 03XXXXXXXXX, +923XXXXXXXXX or 923XXXXXXXXX. Returns the 03... form. */
export function normalizePhone(raw: string) {
  const d = raw.replace(/[\s-]/g, '');
  const m = d.match(/^(?:\+?92|0)(3\d{9})$/);
  return m ? '0' + m[1] : null;
}

export async function findDiscount(code: string | undefined | null, d: Db = db()): Promise<Discount | null> {
  if (!code?.trim()) return null;
  const row = (await d.prepare(`SELECT code, type, value, min_subtotal FROM discounts
    WHERE code = ? AND active = 1 AND (expires_at IS NULL OR expires_at = '' OR expires_at >= date('now'))`).get(code.trim())) as Discount | undefined;
  return row ?? null;
}

export async function placeOrder(input: OrderInput) {
  const name = input.name?.trim().slice(0, 100);
  const phone = normalizePhone(input.phone ?? '');
  const email = input.email?.trim().slice(0, 150) || null;
  const city = input.city?.trim().slice(0, 80);
  const address = input.address?.trim().slice(0, 500);
  const remarks = input.remarks?.trim().slice(0, 1000) || null;
  if (!name) throw new OrderError('Please enter your name.');
  if (!phone) throw new OrderError('Please enter a valid mobile number, e.g. 03001234567.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OrderError('Please enter a valid email address or leave it empty.');
  if (!city) throw new OrderError('Please enter your city.');
  if (!address || address.length < 5) throw new OrderError('Please enter your full address.');
  if (!(input.payment_method in PAYMENT_METHODS)) throw new OrderError('Please choose a payment method.');

  const qtyById = new Map<number, number>();
  for (const it of input.items ?? []) {
    const id = Number(it.id), qty = Math.floor(Number(it.qty));
    if (!Number.isInteger(id) || !(qty >= 1 && qty <= 50)) throw new OrderError('Your cart contains an invalid item.');
    qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
  }
  if (!qtyById.size) throw new OrderError('Your cart is empty.');

  const s = await getSettings();
  // One transaction: prices and stock are read and written together, so two buyers cannot take the last piece twice.
  return tx(async (d) => {
    const getProduct = d.prepare('SELECT * FROM products WHERE id = ? AND hidden = 0');
    const insOrder = d.prepare(`INSERT INTO orders (number,name,phone,email,city,address,remarks,payment_method,subtotal,discount,discount_code,shipping,total)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insItem = d.prepare('INSERT INTO order_items (order_id,product_id,title,code,img,unit_price,qty) VALUES (?,?,?,?,?,?,?)');
    const takeStock = d.prepare(`UPDATE products SET stock = stock - ?, in_stock = CASE WHEN stock - ? <= 0 THEN 0 ELSE in_stock END,
      updated_at = datetime('now') WHERE id = ? AND stock IS NOT NULL`);
    const lines: { p: Product; qty: number; price: number }[] = [];
    for (const [id, qty] of qtyById) {
      const p = (await getProduct.get(id)) as Product | undefined;
      if (!p) throw new OrderError('A product in your cart is no longer available. Please remove it and try again.');
      if (!p.in_stock) throw new OrderError(`${p.title} (${p.code}) is out of stock. Please remove it from your cart.`);
      if (p.stock !== null && p.stock < qty) throw new OrderError(`Only ${p.stock} left of ${p.title} (${p.code}).`);
      lines.push({ p, qty, price: unitPrice(p) });
    }
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const discount = await findDiscount(input.discount_code, d);
    if (input.discount_code?.trim() && !discount) throw new OrderError('That discount code is not valid.');
    const t = totals(subtotal, { charges: s.shipping_charges, freeOver: s.free_shipping_over }, discount);
    const number = 'KK' + crypto.randomBytes(5).toString('hex').toUpperCase();
    const { lastInsertRowid } = (await insOrder.run(number, name, phone, email, city, address, remarks, input.payment_method,
      t.subtotal, t.discount, t.discount ? discount!.code : null, t.shipping, t.total));
    for (const l of lines) {
      await insItem.run(lastInsertRowid, l.p.id, l.p.title, l.p.code, imageUrl(l.p.img, 'product', '100x100_cover'), l.price, l.qty);
      await takeStock.run(l.qty, l.qty, l.p.id);
    }
    if (t.discount) (await d.prepare('UPDATE discounts SET used_count = used_count + 1 WHERE code = ?').run(discount!.code));
    return number;
  });
}

export type Order = {
  id: number; number: string; name: string; phone: string; email: string | null; city: string; address: string; remarks: string | null;
  payment_method: PaymentMethod; subtotal: number; discount: number; discount_code: string | null; shipping: number; total: number;
  status: string; admin_note: string | null; courier: string | null; tracking: string | null; created_at: string;
};
export type OrderItem = { id: number; product_id: number | null; title: string; code: string | null; img: string | null; unit_price: number; qty: number };

export async function orderByNumber(number: string) {
  const o = (await db().prepare('SELECT * FROM orders WHERE number = ?').get(number)) as Order | undefined;
  if (!o) return null;
  return { ...o, items: (await db().prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)) as OrderItem[] };
}

/** Sets an order's status, note, courier and tracking; returns an error message or null. Cancelling returns tracked stock; re-opening a cancelled order takes it again. */
export async function applyOrderUpdate(id: number, f: { status: string; admin_note: string | null; courier: string | null; tracking: string | null }): Promise<string | null> {
  if (!(ORDER_STATUSES as readonly string[]).includes(f.status)) return 'Unknown status.';
  let err: string | null = null;
  await tx(async (d) => {
    const old = (await d.prepare('SELECT status FROM orders WHERE id = ?').get(id)) as { status: string } | undefined;
    if (!old) { err = 'Order not found.'; return; }
    const sign = old.status !== 'cancelled' && f.status === 'cancelled' ? 1 : old.status === 'cancelled' && f.status !== 'cancelled' ? -1 : 0;
    if (sign) {
      const items = (await d.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(id)) as { product_id: number; qty: number }[];
      const st = d.prepare(`UPDATE products SET stock = MAX(stock + ?, 0), in_stock = CASE WHEN stock + ? > 0 THEN 1 ELSE 0 END WHERE id = ? AND stock IS NOT NULL`);
      for (const it of items) await st.run(sign * it.qty, sign * it.qty, it.product_id);
    }
    await d.prepare("UPDATE orders SET status = ?, admin_note = ?, courier = ?, tracking = ?, updated_at = datetime('now') WHERE id = ?")
      .run(f.status, f.admin_note, f.courier, f.tracking, id);
  });
  return err;
}
