import Link from 'next/link';
import { db } from '@/lib/db';
import { imageUrl, type Category, type SubCategory } from '@/lib/catalog';
import { saveCategory } from '../../actions';
import { BTN, BTN_DARK, Card, Check, H1, More, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Categories & collections' };

export default async function Categories({ searchParams }: { searchParams: SP }) {
  const cats = (await db().prepare('SELECT * FROM categories ORDER BY order_no, id').all()) as Category[];
  const subs = (await db().prepare(`SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.sub_category_id = s.id) n FROM sub_categories s ORDER BY order_no, name`)
    .all()) as (SubCategory & { n: number })[];
  return (
    <>
      <H1><span className="flex-1">Categories</span><Link href="/admin/categories/new" className={`${BTN_DARK} font-sans`}>+ Add collection</Link></H1>
      <Notice sp={await searchParams} />
      <p className="-mt-3 mb-6 text-muted">Each main category holds collections, and every product belongs to one collection. Click a collection to change its name or picture.</p>
      {cats.map((c) => {
        const mine = subs.filter((s) => s.category_id === c.id);
        return (
          <Card key={c.id}>
            <form action={saveCategory} className="mb-5 flex flex-wrap items-end gap-3 border-b border-line/70 pb-5">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="alias" value={c.alias} /><input type="hidden" name="order_no" value={c.order_no} />
              <input type="hidden" name="meta_title" value={c.meta_title ?? ''} /><input type="hidden" name="meta_description" value={c.meta_description ?? ''} />
              <div className="min-w-[220px] flex-1"><label className="label" htmlFor={`n${c.id}`}>Main category</label>
                <input id={`n${c.id}`} name="name" defaultValue={c.name} required className="field font-display text-[18px]" /></div>
              <div className="w-[170px]"><Check label="Show in menu" name="status" defaultChecked={!!c.status} /></div>
              <Save>Save</Save>
            </form>
            {mine.length ? (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {mine.map((s) => (
                  <li key={s.id}>
                    <Link href={`/admin/categories/${s.id}`} className="group block rounded-2xl border border-line/70 bg-[#fffdf9] p-4 text-center transition hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_12px_32px_-18px_rgba(53,34,24,.35)]">
                      <span className="relative mx-auto block aspect-square w-full max-w-[150px] overflow-hidden rounded-full bg-soft ring-4 ring-white">
                        {s.img ? <img src={imageUrl(s.img, 'sub_cat', '300x300_cover')} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                          : <span className="flex h-full items-center justify-center text-[12px] text-muted">No picture</span>}
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-[12px] font-semibold uppercase tracking-[0.14em] text-white opacity-0 transition group-hover:opacity-100">Edit</span>
                      </span>
                      <span className="mt-3 block font-semibold text-ink">{s.name}</span>
                      <span className="mt-1 block text-[12px] text-muted">{s.n} products</span>
                      <span className="mt-2 flex flex-wrap justify-center gap-1 text-[11px]">
                        {!s.status && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Not in menu</span>}
                        {!!s.featured && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">On homepage</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted">No collections yet. <Link href="/admin/categories/new" className="text-primary">Add one →</Link></p>}
          </Card>
        );
      })}
      <More title="Add a main category">
        <form action={saveCategory} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1"><label className="label" htmlFor="newcat">Name</label><input id="newcat" name="name" required className="field" placeholder="e.g. Summer Lawn" /></div>
          <input type="hidden" name="status" value="1" />
          <button className={BTN}>Add category</button>
        </form>
      </More>
    </>
  );
}
