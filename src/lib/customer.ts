import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';
import { imageUrl } from './catalog';
import { unitPrice } from './pricing';
import type { Order } from './orders';

// Customer "account": no password. Proving one order number + its mobile signs you in to every order on that mobile.
const COOKIE = 'kk_customer';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const secret = () => { const s = process.env.SESSION_SECRET; return s && s.length >= 32 ? s : null; };
// The "customer:" prefix keeps these signatures from ever matching an admin cookie signature.
const sign = (phone: string, exp: string) => crypto.createHmac('sha256', secret()!).update(`customer:${phone}:${exp}`).digest('base64url');

export function customerToken(phone: string, exp: number) {
  return `${phone}.${exp}.${sign(phone, String(exp))}`;
}

/** Returns the signed-in mobile number, or null. Pure so it can be self-tested. */
export function verifyCustomerToken(v: string | undefined, now = Date.now() / 1000) {
  if (!v || !secret()) return null;
  const [phone, exp, sig] = v.split('.');
  if (!/^03\d{9}$/.test(phone ?? '') || !exp || !sig || Number(exp) <= now) return null;
  const want = Buffer.from(sign(phone, exp));
  const got = Buffer.from(sig);
  return want.length === got.length && crypto.timingSafeEqual(want, got) ? phone : null;
}

export async function startCustomerSession(phone: string) {
  if (!secret()) throw new Error('SESSION_SECRET is not set');
  (await cookies()).set(COOKIE, customerToken(phone, Math.floor(Date.now() / 1000) + MAX_AGE), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

export async function customerPhone() {
  return verifyCustomerToken((await cookies()).get(COOKIE)?.value);
}

export type ReorderItem = { id: number; alias: string; title: string; code: string | null; img: string; price: number; qty: number };
export type AccountOrder = Pick<Order, 'number' | 'status' | 'total' | 'created_at'> & {
  items: { title: string; code: string | null; qty: number }[];
  reorder: ReorderItem[]; // only products still on sale and in stock, at today's price
};

export async function ordersForPhone(phone: string): Promise<AccountOrder[]> {
  const orders = (await db().prepare('SELECT id, number, status, total, created_at FROM orders WHERE phone = ? ORDER BY created_at DESC LIMIT 50').all(phone)) as (AccountOrder & { id: number })[];
  if (!orders.length) return [];
  const rows = (await db().prepare(`SELECT oi.order_id, oi.title, oi.code, oi.qty, p.id AS pid, p.alias, p.title AS ptitle, p.code AS pcode, p.img, p.price, p.sale_price, p.in_stock, p.stock, p.hidden
    FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id IN (${orders.map(() => '?').join(',')}) ORDER BY oi.id`).all(...orders.map((o) => o.id))) as {
    order_id: number; title: string; code: string | null; qty: number; pid: number | null; alias: string; ptitle: string; pcode: string | null;
    img: string | null; price: number; sale_price: number | null; in_stock: number; stock: number | null; hidden: number;
  }[];
  return orders.map(({ id, ...o }) => {
    const mine = rows.filter((r) => r.order_id === id);
    return {
      ...o,
      items: mine.map((r) => ({ title: r.title, code: r.code, qty: Number(r.qty) })),
      reorder: mine.filter((r) => r.pid && !r.hidden && r.in_stock && (r.stock == null || r.stock > 0)).map((r) => ({
        id: Number(r.pid), alias: r.alias, title: r.ptitle, code: r.pcode, img: imageUrl(r.img, 'product', '100x100_cover'),
        price: unitPrice({ price: Number(r.price), sale_price: r.sale_price == null ? null : Number(r.sale_price) }), qty: Number(r.qty),
      })),
    };
  });
}
