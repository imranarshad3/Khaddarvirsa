import Link from 'next/link';
import { db } from '@/lib/db';
import { ORDER_STATUSES, type Order } from '@/lib/orders';
import { Card, H1, OrderTable, type SP } from '../ui';

export const metadata = { title: 'Orders' };

export default async function Orders({ searchParams }: { searchParams: SP }) {
  const { status = '', q = '' } = await searchParams;
  const where: string[] = [];
  const args: string[] = [];
  if ((ORDER_STATUSES as readonly string[]).includes(status)) { where.push('status = ?'); args.push(status); }
  if (q.trim()) { where.push('(number LIKE ? OR name LIKE ? OR phone LIKE ? OR city LIKE ?)'); args.push(...Array(4).fill(`%${q.trim()}%`)); }
  const orders = db().prepare(`SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 200`).all(...args) as Order[];
  return (
    <>
      <H1>Orders <a download href="/admin/export/orders" className="ml-auto rounded-full border border-line bg-white px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-gold">Download CSV</a></H1>
      <div className="mb-3 flex flex-wrap gap-2">
        {['', ...ORDER_STATUSES].map((s) => (
          <Link key={s} href={s ? `/admin/orders?status=${s}` : '/admin/orders'}
            className={`rounded-full px-4 py-1.5 capitalize ${s === status ? 'bg-ink-2 text-white' : 'bg-white shadow-card'}`}>{s || 'All'}</Link>
        ))}
        <form className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Order no, name, phone, city" aria-label="Search orders" className="field w-[240px]" />
          <button className="rounded bg-ink-2 px-3 text-white">Search</button>
        </form>
      </div>
      <Card>{orders.length ? <OrderTable orders={orders} /> : <p>No orders found.</p>}</Card>
      {orders.length === 200 && <p className="text-muted">Showing the latest 200. Narrow the search to find older orders.</p>}
    </>
  );
}
