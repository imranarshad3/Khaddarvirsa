import Link from 'next/link';
import { db } from '@/lib/db';
import { imageUrl, type Product } from '@/lib/catalog';
import { quickUpdateProducts } from '../../actions';
import { BTN, BTN_DARK, Card, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Products' };
const PER = 50;

export default async function Products({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { q = '', sub = '', stock = '' } = sp;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (q.trim()) { where.push('(p.title LIKE ? OR p.code LIKE ?)'); args.push(`%${q.trim()}%`, `%${q.trim()}%`); }
  if (Number(sub)) { where.push('p.sub_category_id = ?'); args.push(Number(sub)); }
  if (stock === 'out') where.push('p.in_stock = 0');
  if (stock === 'hidden') where.push('p.hidden = 1');
  if (stock === 'low') where.push('p.stock BETWEEN 1 AND 3');
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = ((await db().prepare(`SELECT COUNT(*) n FROM products p ${w}`).get(...args)) as { n: number }).n;
  const rows = (await db().prepare(`SELECT p.*, s.name sub_name FROM products p JOIN sub_categories s ON s.id = p.sub_category_id ${w} ORDER BY p.id DESC LIMIT ? OFFSET ?`)
    .all(...args, PER, (page - 1) * PER)) as (Product & { sub_name: string })[];
  const subs = (await db().prepare('SELECT id, name FROM sub_categories ORDER BY name').all()) as { id: number; name: string }[];
  const qs = (n: number) => '?' + new URLSearchParams({ ...(q && { q }), ...(sub && { sub }), ...(stock && { stock }), page: String(n) });
  const back = '/admin/products' + qs(page);
  return (
    <>
      <div className="flex items-center justify-between"><H1>Products ({total})</H1>
        <Link href="/admin/products/new" className={`${BTN_DARK} mb-6`}>+ Add product</Link></div>
      <Notice sp={sp} />
      <p className="-mt-3 mb-4 text-muted">Click a product to edit it fully, or change price and stock right here and press Save.</p>
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Title or code" aria-label="Search products" className="field w-[200px]" />
        <select name="sub" defaultValue={sub} aria-label="Collection" className="field w-[220px]">
          <option value="">All collections</option>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="stock" defaultValue={stock} aria-label="Status" className="field w-[150px]">
          <option value="">Any status</option><option value="out">Out of stock</option><option value="low">Low stock (1–3)</option><option value="hidden">Hidden</option>
        </select>
        <button className={BTN}>Search</button>
      </form>
      <Card>
        <form action={quickUpdateProducts}>
          <input type="hidden" name="back" value={back} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr><th className="py-2" /><th>Product</th><th>Price</th><th>Sale price</th><th>Stock qty</th><th>In stock</th><th>Hidden</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-line/70 transition-colors last:border-0 hover:bg-soft/60">
                    <td className="py-1.5 pr-2"><input type="hidden" name="ids" value={p.id} />
                      <Link href={`/admin/products/${p.id}`} aria-hidden tabIndex={-1}><img src={imageUrl(p.img, 'product', '100x100_cover')} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" /></Link></td>
                    <td className="pr-3"><Link href={`/admin/products/${p.id}`} className="font-semibold text-ink hover:text-gold-dark">{p.title}</Link>
                      <div className="text-[12px] text-muted">{p.code} · {p.sub_name}{p.hidden ? ' · hidden' : ''}{p.on_sale ? ' · sale' : ''}{p.premium ? ' · ★ premium' : ''}</div></td>
                    <td><input name={`price_${p.id}`} type="number" min={1} required defaultValue={p.price} aria-label={`Price of ${p.title}`} className="field w-[90px]" /></td>
                    <td><input name={`sale_${p.id}`} type="number" min={1} defaultValue={p.sale_price ?? ''} aria-label={`Sale price of ${p.title}`} className="field w-[90px]" /></td>
                    <td><input name={`stock_${p.id}`} type="number" min={0} defaultValue={p.stock ?? ''} placeholder="—" aria-label={`Stock of ${p.title}`} className="field w-[80px]" /></td>
                    <td><input name={`instock_${p.id}`} type="checkbox" defaultChecked={!!p.in_stock} aria-label={`${p.title} in stock`} className="h-4 w-4 accent-[#795536]" /></td>
                    <td><input name={`hidden_${p.id}`} type="checkbox" defaultChecked={!!p.hidden} aria-label={`Hide ${p.title} from the shop`} className="h-4 w-4 accent-[#795536]" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 0 ? <div className="mt-3"><Save>Save changes on this page</Save></div> : <p>No products found.</p>}
        </form>
      </Card>
      <nav className="flex gap-3" aria-label="Pages">
        {page > 1 && <Link href={'/admin/products' + qs(page - 1)} className={BTN}>← Previous</Link>}
        {page * PER < total && <Link href={'/admin/products' + qs(page + 1)} className={BTN}>Next →</Link>}
      </nav>
    </>
  );
}
