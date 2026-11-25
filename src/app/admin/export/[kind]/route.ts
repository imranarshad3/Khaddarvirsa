import { db } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

// Route handlers sit outside the panel layout, so this checks the admin session itself.
const QUERIES: Record<string, string> = {
  orders: `SELECT o.number, o.created_at, o.status, o.name, o.phone, o.email, o.city, o.address, o.payment_method,
    o.subtotal, o.discount, o.discount_code, o.shipping, o.total,
    (SELECT GROUP_CONCAT(i.qty || ' x ' || i.title || COALESCE(' (' || i.code || ')', ''), '; ') FROM order_items i WHERE i.order_id = o.id) items,
    o.courier, o.tracking, o.remarks, o.admin_note FROM orders o ORDER BY o.id DESC`,
  products: `SELECT p.id, p.code, p.title, s.name collection, p.price, p.sale_price, p.stock, p.in_stock, p.hidden, p.on_sale, p.premium, p.alias
    FROM products p JOIN sub_categories s ON s.id = p.sub_category_id ORDER BY p.id DESC`,
  subscribers: 'SELECT email, created_at FROM subscribers ORDER BY id DESC',
};

// Quote every cell, and defuse values a spreadsheet would run as a formula.
const cell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await isAdmin())) return new Response('Unauthorized', { status: 401 });
  const { kind } = await params;
  const sql = QUERIES[kind];
  if (!sql) return new Response('Not found', { status: 404 });
  const rows = (await db().prepare(sql).all()) as Record<string, unknown>[];
  const cols = rows[0] ? Object.keys(rows[0]) : [];
  const csv = '﻿' + [cols.map(cell).join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
