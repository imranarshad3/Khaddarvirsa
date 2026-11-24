import Link from 'next/link';
import { db } from '@/lib/db';
import type { Category, SubCategory } from '@/lib/catalog';
import { saveCategory } from '../../actions';
import { Card, Check, H1, Notice, Save, type SP } from '../ui';
import SubForm from './SubForm';

export const metadata = { title: 'Categories & collections' };

export default async function Categories({ searchParams }: { searchParams: SP }) {
  const cats = (await db().prepare('SELECT * FROM categories ORDER BY order_no, id').all()) as Category[];
  const subs = (await db().prepare(`SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.sub_category_id = s.id) n FROM sub_categories s ORDER BY order_no, name`)
    .all()) as (SubCategory & { n: number })[];
  return (
    <>
      <H1>Categories &amp; collections</H1>
      <Notice sp={await searchParams} />
      <p className="mb-4 text-muted">Main categories hold collections; products belong to one collection. “Today&rsquo;s sale” is set per product.</p>
      {cats.map((c) => (
        <Card key={c.id}>
          <form action={saveCategory} className="mb-3 grid items-end gap-2 sm:grid-cols-[1fr_1fr_80px_auto_auto]">
            <input type="hidden" name="id" value={c.id} />
            <div><label className="label" htmlFor={`n${c.id}`}>Main category</label><input id={`n${c.id}`} name="name" defaultValue={c.name} required className="field font-bold" /></div>
            <div><label className="label" htmlFor={`a${c.id}`}>Alias</label><input id={`a${c.id}`} name="alias" defaultValue={c.alias} className="field" /></div>
            <div><label className="label" htmlFor={`o${c.id}`}>Order</label><input id={`o${c.id}`} name="order_no" type="number" defaultValue={c.order_no} className="field" /></div>
            <Check label="In menu" name="status" defaultChecked={!!c.status} />
            <Save />
            <input type="hidden" name="meta_title" value={c.meta_title ?? ''} /><input type="hidden" name="meta_description" value={c.meta_description ?? ''} />
          </form>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {subs.filter((s) => s.category_id === c.id).map((s) => (
              <li key={s.id}><Link href={`/admin/categories/${s.id}`} className="text-primary hover:underline">{s.name}</Link>
                <span className="text-[12px] text-muted"> · {s.n} products{s.status ? '' : ' · not in menu'}{s.featured ? ' · homepage' : ''}</span></li>
            ))}
          </ul>
        </Card>
      ))}
      <Card title="Add a collection"><SubForm cats={cats} /></Card>
      <Card title="Add a main category">
        <form action={saveCategory} className="flex flex-wrap items-end gap-2">
          <div><label className="label" htmlFor="newcat">Name</label><input id="newcat" name="name" required className="field" /></div>
          <input type="hidden" name="status" value="1" />
          <Save>Add</Save>
        </form>
      </Card>
    </>
  );
}
