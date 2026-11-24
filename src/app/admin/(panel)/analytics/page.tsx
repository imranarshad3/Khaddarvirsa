import Link from 'next/link';
import { db } from '@/lib/db';
import { rs } from '@/lib/pricing';
import { Card, H1, type SP } from '../ui';

export const metadata = { title: 'Analytics' };

const RANGES = { '7': 'Last 7 days', '30': 'Last 30 days', '90': 'Last 90 days', '365': 'Last 12 months' } as const;
type Range = keyof typeof RANGES;
const SOLD = "o.status != 'cancelled'"; // revenue counts every order that was not cancelled

export default async function Analytics({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const range: Range = sp.range && sp.range in RANGES ? (sp.range as Range) : '30';
  const since = `-${range} days`;
  const d = db();

  const totals = d.prepare(`SELECT COUNT(*) orders, COALESCE(SUM(total),0) revenue, COALESCE(SUM(discount),0) discount
    FROM orders o WHERE ${SOLD} AND o.created_at >= datetime('now', ?)`).get(since) as { orders: number; revenue: number; discount: number };
  const cancelled = (d.prepare(`SELECT COUNT(*) n FROM orders WHERE status = 'cancelled' AND created_at >= datetime('now', ?)`).get(since) as { n: number }).n;
  const units = (d.prepare(`SELECT COALESCE(SUM(i.qty),0) n FROM order_items i JOIN orders o ON o.id = i.order_id WHERE ${SOLD} AND o.created_at >= datetime('now', ?)`).get(since) as { n: number }).n;
  const bucket = range === '365' ? '%Y-%m' : '%Y-%m-%d';
  const series = d.prepare(`SELECT strftime('${bucket}', o.created_at) day, COUNT(*) orders, SUM(total) revenue FROM orders o
    WHERE ${SOLD} AND o.created_at >= datetime('now', ?) GROUP BY day ORDER BY day`).all(since) as { day: string; orders: number; revenue: number }[];
  const top = d.prepare(`SELECT i.title, i.code, SUM(i.qty) qty, SUM(i.qty * i.unit_price) revenue FROM order_items i JOIN orders o ON o.id = i.order_id
    WHERE ${SOLD} AND o.created_at >= datetime('now', ?) GROUP BY COALESCE(i.product_id, i.title) ORDER BY revenue DESC LIMIT 10`).all(since) as { title: string; code: string | null; qty: number; revenue: number }[];
  const cats = d.prepare(`SELECT COALESCE(c.name, 'Removed products') name, SUM(i.qty) qty, SUM(i.qty * i.unit_price) revenue FROM order_items i JOIN orders o ON o.id = i.order_id
    LEFT JOIN products p ON p.id = i.product_id LEFT JOIN sub_categories s ON s.id = p.sub_category_id LEFT JOIN categories c ON c.id = s.category_id
    WHERE ${SOLD} AND o.created_at >= datetime('now', ?) GROUP BY c.id ORDER BY revenue DESC`).all(since) as { name: string; qty: number; revenue: number }[];
  const statuses = d.prepare(`SELECT status, COUNT(*) n FROM orders WHERE created_at >= datetime('now', ?) GROUP BY status ORDER BY n DESC`).all(since) as { status: string; n: number }[];
  const payments = d.prepare(`SELECT payment_method m, COUNT(*) n FROM orders o WHERE ${SOLD} AND o.created_at >= datetime('now', ?) GROUP BY m ORDER BY n DESC`).all(since) as { m: string; n: number }[];
  const cities = d.prepare(`SELECT city, COUNT(*) n FROM orders o WHERE ${SOLD} AND o.created_at >= datetime('now', ?) GROUP BY LOWER(TRIM(city)) ORDER BY n DESC LIMIT 8`).all(since) as { city: string; n: number }[];

  const max = Math.max(1, ...series.map((x) => x.revenue));
  const stats = [
    ['Revenue', rs(totals.revenue)], ['Orders', totals.orders], ['Average order', rs(totals.orders ? Math.round(totals.revenue / totals.orders) : 0)],
    ['Units sold', units], ['Discounts given', rs(totals.discount)], ['Cancelled orders', cancelled],
  ] as const;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <H1>Analytics</H1>
        <nav aria-label="Date range" className="flex flex-wrap gap-1">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <Link key={r} href={`/admin/analytics?range=${r}`} aria-current={r === range ? 'page' : undefined}
              className={`rounded-full px-4 py-1.5 text-[13px] transition ${r === range ? 'bg-ink text-white' : 'border border-line bg-white hover:border-gold'}`}>{RANGES[r]}</Link>
          ))}
        </nav>
      </div>
      <p className="mb-4 text-[12px] text-muted">From real orders in the store database. Revenue excludes cancelled orders; Cash on Delivery orders count when placed, not when paid.</p>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line/70 bg-white p-5 shadow-[0_12px_32px_-20px_rgba(53,34,24,.25)]">
            <div className="font-display text-[26px] leading-none text-ink">{value}</div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
          </div>
        ))}
      </div>

      <Card title={`Revenue by ${range === '365' ? 'month' : 'day'}`} className="mb-5">
        {series.length ? (
          <div className="flex h-[200px] items-end gap-1 overflow-x-auto" role="list">
            {series.map((x) => (
              <div key={x.day} role="listitem" className="flex h-full min-w-[22px] flex-1 flex-col items-center justify-end gap-1" title={`${x.day}: ${rs(x.revenue)} · ${x.orders} order(s)`}>
                <div className="w-full rounded-t-md bg-gradient-to-t from-gold-dark to-sand" style={{ height: `${Math.max(3, (x.revenue / max) * 100)}%` }} />
                <span className="text-[10px] text-muted">{x.day.slice(range === '365' ? 2 : 5)}</span>
              </div>
            ))}
          </div>
        ) : <p>No orders in this period.</p>}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Top products">
          {top.length ? (
            <table className="w-full text-left"><thead><tr className="text-[12px] text-muted"><th className="py-1">Product</th><th>Qty</th><th className="text-right">Revenue</th></tr></thead>
              <tbody>{top.map((t, i) => <tr key={i} className="border-t border-line"><td className="py-1.5">{t.title}{t.code && <span className="text-muted"> · {t.code}</span>}</td><td>{t.qty}</td><td className="text-right">{rs(t.revenue)}</td></tr>)}</tbody></table>
          ) : <p>No sales in this period.</p>}
        </Card>
        <Card title="Sales by category">
          {cats.length ? (
            <table className="w-full text-left"><thead><tr className="text-[12px] text-muted"><th className="py-1">Category</th><th>Qty</th><th className="text-right">Revenue</th></tr></thead>
              <tbody>{cats.map((c, i) => <tr key={i} className="border-t border-line"><td className="py-1.5">{c.name}</td><td>{c.qty}</td><td className="text-right">{rs(c.revenue)}</td></tr>)}</tbody></table>
          ) : <p>No sales in this period.</p>}
        </Card>
        <Card title="Orders by status">
          {statuses.length ? <ul>{statuses.map((s) => <li key={s.status} className="flex justify-between border-t border-line py-1.5 capitalize first:border-0"><span>{s.status}</span><strong>{s.n}</strong></li>)}</ul> : <p>No orders in this period.</p>}
        </Card>
        <Card title="Payment methods & top cities">
          {payments.length ? (
            <div className="grid grid-cols-2 gap-4">
              <ul>{payments.map((p) => <li key={p.m} className="flex justify-between py-1 uppercase"><span>{p.m}</span><strong>{p.n}</strong></li>)}</ul>
              <ul>{cities.map((c) => <li key={c.city} className="flex justify-between py-1 capitalize"><span>{c.city}</span><strong>{c.n}</strong></li>)}</ul>
            </div>
          ) : <p>No orders in this period.</p>}
        </Card>
      </div>
    </>
  );
}
