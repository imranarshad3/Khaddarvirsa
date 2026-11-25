import Link from 'next/link';
import { db } from '@/lib/db';
import { rs } from '@/lib/pricing';
import type { Order } from '@/lib/orders';
import { imageUrl } from '@/lib/catalog';
import { Card, OrderTable } from './ui';
import { Icon } from './AdminNav';

export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  const d = db();
  const n = async (sql: string) => ((await d.prepare(sql).get()) as { n: number }).n;
  const stats = [
    ['Revenue, not cancelled', rs(await n("SELECT COALESCE(SUM(total),0) n FROM orders WHERE status != 'cancelled'")), '/admin/analytics', 'analytics'],
    ['Pending orders', await n("SELECT COUNT(*) n FROM orders WHERE status = 'pending'"), '/admin/orders?status=pending', 'orders'],
    ['Orders (all)', await n('SELECT COUNT(*) n FROM orders'), '/admin/orders', 'orders'],
    ['Products', await n('SELECT COUNT(*) n FROM products'), '/admin/products', 'products'],
    ['Out of stock', await n('SELECT COUNT(*) n FROM products WHERE in_stock = 0'), '/admin/products?stock=out', 'products'],
    ["Today's orders", await n("SELECT COUNT(*) n FROM orders WHERE date(created_at) = date('now')"), '/admin/orders', 'orders'],
  ] as const;
  const lowCount = await n('SELECT COUNT(*) n FROM products WHERE stock BETWEEN 1 AND 3 AND hidden = 0');
  const outCount = Number(stats[4][1]);
  const recent = (await d.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 10').all()) as Order[];
  const low = (await d.prepare('SELECT id, title, code, img, stock FROM products WHERE stock BETWEEN 1 AND 3 AND hidden = 0 ORDER BY stock, id DESC LIMIT 8')
    .all()) as { id: number; title: string; code: string | null; img: string | null; stock: number }[];
  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-ink px-6 py-8 text-white md:px-10 md:py-10">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,rgba(212,178,137,.35),transparent_60%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sand">{new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="mt-2 font-display text-[34px] leading-tight text-white md:text-[42px]">Welcome back</h1>
            <p className="mt-1 text-white/70">Here is how the store is doing today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/products/new" className="rounded-full bg-sand px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-white">+ New product</Link>
            <Link href="/admin/orders?status=pending" className="rounded-full border border-white/25 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-sand hover:text-sand">Pending orders</Link>
          </div>
        </div>
      </section>
      {(lowCount > 0 || outCount > 0) && (
        <div role="status" className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900">
          <span aria-hidden className="text-[20px]">⚠</span>
          <p className="flex-1"><b>Stock alert:</b> {lowCount > 0 && `${lowCount} product${lowCount > 1 ? 's are' : ' is'} almost sold out (3 or fewer left)`}{lowCount > 0 && outCount > 0 && ' and '}{outCount > 0 && `${outCount} ${outCount > 1 ? 'are' : 'is'} out of stock`}.</p>
          {lowCount > 0 && <Link href="/admin/products?stock=low" className="rounded-full bg-amber-900 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-amber-800">See low stock</Link>}
          {outCount > 0 && <Link href="/admin/products?stock=out" className="rounded-full border border-amber-900/30 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] hover:border-amber-900">See out of stock</Link>}
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(([label, value, href, icon]) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line/70 bg-white p-5 shadow-[0_12px_32px_-20px_rgba(53,34,24,.25)] transition hover:-translate-y-0.5 hover:border-gold/50">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-soft text-gold-dark transition group-hover:bg-ink group-hover:text-sand"><Icon name={icon} /></span>
            <div className="font-display text-[26px] leading-none text-ink">{value}</div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
          </Link>
        ))}
      </div>
      <Card title="Recent orders">
        {recent.length ? <OrderTable orders={recent} /> : <p>No orders yet.</p>}
      </Card>
      {low.length > 0 && (
        <Card title="Low stock">
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {low.map((p) => (
              <li key={p.id}><Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 rounded-xl border border-line/70 p-2 hover:border-gold/50">
                <img src={imageUrl(p.img, 'product', '100x100_cover')} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
                <span className="min-w-0 flex-1"><span className="block truncate text-ink">{p.title}</span><span className="text-[12px] text-muted">{p.code}</span></span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] font-semibold text-amber-900">{p.stock} left</span>
              </Link></li>
            ))}
          </ul>
          <Link href="/admin/products?stock=low" className="mt-3 inline-block text-primary">See all low-stock products →</Link>
        </Card>
      )}
    </>
  );
}

