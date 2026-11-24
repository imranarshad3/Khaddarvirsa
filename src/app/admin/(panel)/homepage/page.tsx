import Link from 'next/link';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { saveHomepage } from '../../actions';
import { Area, Card, Field, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Homepage' };

export default async function Homepage({ searchParams }: { searchParams: SP }) {
  const { sliders } = (await getSettings());
  const featured = (await db().prepare('SELECT id, name, home_order_no FROM sub_categories WHERE featured = 1 ORDER BY home_order_no, name').all()) as { id: number; name: string; home_order_no: number }[];
  return (
    <>
      <H1>Homepage</H1>
      <Notice sp={await searchParams} />
      <Card title="Slider">
        <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {sliders.map((s, i) => <img key={i} src={s.img} alt={`Slide ${i + 1}`} className="aspect-[2.4] w-full rounded object-cover" loading="lazy" />)}
        </div>
        <form action={saveHomepage} className="grid gap-3">
          <Area label="Slides — one per line: image URL | link (optional)" name="sliders" rows={Math.max(4, sliders.length + 1)}
            defaultValue={sliders.map((s) => `${s.img} | ${s.link}`).join('\n')} hint="Delete a line to remove a slide; reorder lines to reorder slides." />
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="new_slide">Add a slide image (wide, about 1920×800)</label>
              <input id="new_slide" type="file" name="new_slide" accept="image/jpeg,image/png,image/webp,image/gif" /></div>
            <Field label="Link for the new slide" name="new_slide_link" placeholder="/main-category/winter-unstitched" />
          </div>
          <div><Save /></div>
        </form>
      </Card>
      <Card title="Featured collections">
        <p className="mb-2 text-muted">Shown on the homepage in this order. Change them on each collection (“Feature on homepage” and “Homepage order”).</p>
        <ol className="list-decimal pl-5">
          {featured.map((f) => <li key={f.id}><Link href={`/admin/categories/${f.id}`} className="text-primary">{f.name}</Link> <span className="text-muted">(order {f.home_order_no})</span></li>)}
        </ol>
      </Card>
    </>
  );
}
