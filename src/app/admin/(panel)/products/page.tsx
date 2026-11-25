import Link from 'next/link';
import { db } from '@/lib/db';
import { imageUrl, type Product } from '@/lib/catalog';
import { bulkProducts, deleteProductRow, duplicateProductRow, importProducts, quickUpdateProducts } from '../../actions';
import ConfirmButton from '../ConfirmButton';
import SelectAll from './SelectAll';
import { BTN, BTN_DARK, Card, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Products' };
const PER = 50;

const STATUS: Record<string, [label: string, sql: string]> = {
  live: ['In the shop', 'p.hidden = 0'],
  hidden: ['Hidden', 'p.hidden = 1'],
  out: ['Out of stock', 'p.in_stock = 0'],
  low: ['Low stock (1–3)', 'p.stock BETWEEN 1 AND 3'],
  premium: ['★ Premium', 'p.premium > 0'],
  sale: ['On sale page', 'p.on_sale = 1'],
};
const SORT: Record<string, [label: string, sql: string]> = {
  new: ['Newest first', 'p.id DESC'],
  name: ['Name A–Z', 'p.title COLLATE NOCASE'],
  cheap: ['Price: low to high', 'p.price, p.id DESC'],
  dear: ['Price: high to low', 'p.price DESC, p.id DESC'],
  premium: ['Premium order', '(p.premium = 0), p.premium, p.id DESC'],
};
const ROW_BTN = 'rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-2 hover:border-gold';

export default async function Products({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { q = '', sub = '', stock = '', sort = 'new' } = sp;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (q.trim()) { where.push('(p.title LIKE ? OR p.code LIKE ?)'); args.push(`%${q.trim()}%`, `%${q.trim()}%`); }
  if (Number(sub)) { where.push('p.sub_category_id = ?'); args.push(Number(sub)); }
  if (STATUS[stock]) where.push(STATUS[stock][1]);
  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const [{ n: total }, counts, rows, subs] = await Promise.all([
    db().prepare(`SELECT COUNT(*) n FROM products p ${w}`).get(...args) as Promise<{ n: number }>,
    db().prepare(`SELECT COUNT(*) n, ${Object.entries(STATUS).map(([k, [, sql]]) => `SUM(${sql}) ${k}`).join(', ')} FROM products p`).get() as Promise<Record<string, number>>,
    db().prepare(`SELECT p.*, s.name sub_name FROM products p JOIN sub_categories s ON s.id = p.sub_category_id ${w} ORDER BY ${(SORT[sort] ?? SORT.new)[1]} LIMIT ? OFFSET ?`)
      .all(...args, PER, (page - 1) * PER) as Promise<(Product & { sub_name: string })[]>,
    db().prepare('SELECT id, name FROM sub_categories ORDER BY name').all() as Promise<{ id: number; name: string }[]>,
  ]);
  const qs = (o: Record<string, string>) => '?' + new URLSearchParams(Object.entries({ q, sub, stock, sort, page: String(page), ...o }).filter(([k, v]) => v && !(k === 'sort' && v === 'new')));
  const back = '/admin/products' + qs({});
  const chip = (key: string, label: string, n: number) => (
    <Link key={key || 'all'} href={'/admin/products' + qs({ stock: key, page: '1' })} aria-current={stock === key ? 'true' : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${stock === key ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2 hover:border-gold'}`}>
      {label} <span className="opacity-60">{Number(n) || 0}</span>
    </Link>
  );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><H1>Products ({total})</H1>
        <Link href="/admin/products/new" className={`${BTN_DARK} mb-6`}>+ Add product</Link></div>
      <Notice sp={sp} />
      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
        {chip('', 'All', counts.n)}
        {Object.entries(STATUS).map(([k, [label]]) => chip(k, label, counts[k]))}
      </nav>
      <form className="mb-4 flex flex-wrap gap-2">
        {stock && <input type="hidden" name="stock" value={stock} />}
        <input name="q" defaultValue={q} placeholder="Title or code" aria-label="Search products" className="field w-[200px]" />
        <select name="sub" defaultValue={sub} aria-label="Collection" className="field w-[220px]">
          <option value="">All collections</option>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort" className="field w-[190px]">
          {Object.entries(SORT).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <button className={BTN}>Search</button>
        {(q || sub || stock || sort !== 'new') && <Link href="/admin/products" className={BTN}>Clear</Link>}
      </form>
      <details className="mb-4 rounded-2xl border border-line/70 bg-white px-5 py-3">
        <summary className="cursor-pointer text-[13px] font-semibold text-ink-2">Edit many prices and stock in Excel (CSV)</summary>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[13px] text-muted">
          <li><a download href="/admin/export/products" className="font-semibold text-primary underline">Download the products CSV</a>.</li>
          <li>Open it in Excel or Google Sheets and change <b>price</b>, <b>sale_price</b>, <b>stock</b>, <b>in_stock</b>, <b>hidden</b>, <b>on_sale</b> (1 = yes, 0 = no). Leave <b>id</b> as it is. Other columns are ignored.</li>
          <li>Save as CSV and upload it here. If any row has a mistake, nothing is changed and you are told which row.</li>
        </ol>
        <form action={importProducts} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="file" name="file" accept=".csv,text/csv" required aria-label="Products CSV file" className="text-[13px]" />
          <button className={BTN}>Upload CSV</button>
        </form>
      </details>
      <p className="mb-3 text-[13px] text-muted">Change price or stock right in the table and press <b>Save changes</b>. Tick products to hide, show, mark premium or delete many at once.</p>
      <Card>
        <form action={quickUpdateProducts}>
          {/* First submit button = what Enter does in a price field: save, never a row or bulk action. */}
          <button className="sr-only" tabIndex={-1} aria-hidden>Save</button>
          <input type="hidden" name="back" value={back} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr><th className="w-8 py-2"><SelectAll /></th><th /><th>Product</th><th>Price</th><th>Sale price</th><th>Stock qty</th><th className="px-2">In stock</th><th className="px-2">Hidden</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className={`border-b border-line/70 transition-colors last:border-0 hover:bg-soft/60 ${p.hidden ? 'opacity-70' : ''}`}>
                    <td><input type="checkbox" name="sel" value={p.id} aria-label={`Select ${p.title}`} className="h-4 w-4 accent-[#795536]" /></td>
                    <td className="py-1.5 pr-2"><input type="hidden" name="ids" value={p.id} />
                      <Link href={`/admin/products/${p.id}`} aria-hidden tabIndex={-1}><img src={imageUrl(p.img, 'product', '100x100_cover')} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" /></Link></td>
                    <td className="pr-3"><Link href={`/admin/products/${p.id}`} className="font-semibold text-ink hover:text-gold-dark">{p.title}</Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">{p.code} · {p.sub_name}
                        {p.premium > 0 && <span className="rounded-full bg-gold/15 px-2 py-px font-semibold text-gold-dark">★ Premium #{p.premium}</span>}
                        {p.on_sale ? <span className="rounded-full bg-red-50 px-2 py-px font-semibold text-sale">Sale</span> : null}
                        {p.hidden ? <span className="rounded-full bg-gray-200 px-2 py-px font-semibold text-gray-700">Hidden</span> : null}</div></td>
                    <td><input name={`price_${p.id}`} type="number" min={1} required defaultValue={p.price} aria-label={`Price of ${p.title}`} className="field w-[90px]" /></td>
                    <td><input name={`sale_${p.id}`} type="number" min={1} defaultValue={p.sale_price ?? ''} aria-label={`Sale price of ${p.title}`} className="field w-[90px]" /></td>
                    <td><input name={`stock_${p.id}`} type="number" min={0} defaultValue={p.stock ?? ''} placeholder="—" aria-label={`Stock of ${p.title}`} className="field w-[80px]" /></td>
                    <td className="px-2"><Toggle name={`instock_${p.id}`} on={!!p.in_stock} label={`${p.title} in stock`} /></td>
                    <td className="px-2"><Toggle name={`hidden_${p.id}`} on={!!p.hidden} label={`Hide ${p.title} from the shop`} /></td>
                    <td className="whitespace-nowrap text-right">
                      <span className="inline-flex gap-1.5">
                        <Link href={`/admin/products/${p.id}`} className={ROW_BTN}>Edit</Link>
                        <Link href={`/product/${p.alias}`} target="_blank" className={ROW_BTN} aria-label={`View ${p.title} in shop`}>View ↗</Link>
                        <button formAction={duplicateProductRow.bind(null, p.id)} formNoValidate className={ROW_BTN} aria-label={`Duplicate ${p.title}`}>Copy</button>
                        <ConfirmButton message={`Delete "${p.title}" permanently? This cannot be undone. To pause it instead, tick Hidden.`}
                          formAction={deleteProductRow.bind(null, p.id)} formNoValidate aria-label={`Delete ${p.title}`}
                          className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sale hover:bg-red-50">Delete</ConfirmButton>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line/70 pt-4">
              <Save>Save changes on this page</Save>
              <span className="ml-auto flex flex-wrap items-center gap-2">
                <label htmlFor="bulk" className="text-[13px] font-semibold text-ink-2">With ticked products:</label>
                <select id="bulk" name="bulk" defaultValue="" className="field w-[210px]">
                  <option value="">Choose an action…</option>
                  <option value="premium_on">★ Make premium</option>
                  <option value="premium_off">Remove from premium</option>
                  <option value="show">Show in shop</option>
                  <option value="hide">Hide from shop</option>
                  <option value="in">Mark in stock</option>
                  <option value="out">Mark out of stock</option>
                  <option value="sale_on">Add to sale page</option>
                  <option value="sale_off">Remove from sale page</option>
                  <option value="delete">Delete permanently</option>
                </select>
                <ConfirmButton message="Apply this action to all ticked products? (Delete cannot be undone.)" formAction={bulkProducts} formNoValidate className={BTN}>Apply</ConfirmButton>
              </span>
            </div>
          ) : <p>No products found.</p>}
        </form>
      </Card>
      <nav className="flex gap-3" aria-label="Pages">
        {page > 1 && <Link href={'/admin/products' + qs({ page: String(page - 1) })} className={BTN}>← Previous</Link>}
        {page * PER < total && <Link href={'/admin/products' + qs({ page: String(page + 1) })} className={BTN}>Next →</Link>}
        {total > PER && <span className="self-center text-[13px] text-muted">Page {page} of {Math.ceil(total / PER)}</span>}
      </nav>
    </>
  );
}

/** Checkbox drawn as an on/off switch; still a real checkbox so the form posts it the same way. */
function Toggle({ name, on, label }: { name: string; on: boolean; label: string }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input name={name} type="checkbox" defaultChecked={on} aria-label={label} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-[#ddd3c7] transition-colors peer-checked:bg-[#795536] peer-focus-visible:ring-2 peer-focus-visible:ring-[#b8925a] peer-focus-visible:ring-offset-2" />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}
