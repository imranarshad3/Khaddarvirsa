import Link from 'next/link';
import { db } from '@/lib/db';
import { deletePage, savePage } from '../../actions';
import ConfirmButton from '../ConfirmButton';
import { getSettings } from '@/lib/settings';
import { Area, Card, Check, Field, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Pages' };
type P = { slug: string; title: string; body: string; meta_description: string | null; updated_at: string };

export default async function Pages({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const pages = (await db().prepare('SELECT * FROM pages ORDER BY title').all()) as P[];
  const edit = pages.find((p) => p.slug === sp.edit);
  const menu = (await getSettings()).menu_pages;
  return (
    <>
      <H1>Pages</H1>
      <Notice sp={sp} />
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <Card title="All pages">
          <ul className="grid gap-1">
            {pages.map((p) => (
              <li key={p.slug}><Link href={`/admin/pages?edit=${p.slug}`} className={`hover:underline ${p.slug === sp.edit ? 'font-bold' : 'text-primary'}`}>{p.title}</Link>
                {!p.body && <span className="text-[12px] text-sale"> · empty</span>}{menu.includes(p.slug) && <span className="text-[12px] text-gold-dark"> · in menu</span>}</li>
            ))}
            <li className="mt-2"><Link href="/admin/pages" className="text-primary">+ New page</Link></li>
          </ul>
        </Card>
        <Card title={edit ? `Edit: ${edit.title}` : 'New page'}>
          <form action={savePage} key={edit?.slug ?? 'new'} className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" name="title" required defaultValue={edit?.title} />
              <Field label="URL" name="slug" required defaultValue={edit?.slug} readOnly={!!edit} hint={edit ? `/${edit.slug}` : 'e.g. shipping-policy → /shipping-policy'} />
            </div>
            <Area label="Content" name="body" rows={16} defaultValue={edit?.body}
              hint="Plain text. Blank line = new paragraph; a line starting with “# ” is a heading; “- ” starts a list item. Empty pages show “content coming soon” and are not indexed." />
            <Field label="Meta description" name="meta_description" defaultValue={edit?.meta_description ?? ''} maxLength={170} />
            <Check label="Show this page in the website menu" name="in_menu" defaultChecked={edit ? menu.includes(edit.slug) : false} />
            <div className="flex items-center gap-3"><Save />{edit && <Link href={`/${edit.slug}`} target="_blank" className="text-primary">View ↗</Link>}</div>
          </form>
          {edit && (
            <form action={deletePage} className="mt-5 border-t border-line pt-4">
              <input type="hidden" name="slug" value={edit.slug} />
              <ConfirmButton message={`Delete the page "${edit.title}"? Its URL will stop working.`} className="rounded-full border border-sale px-5 py-2 text-sale hover:bg-red-50">Delete page</ConfirmButton>
            </form>
          )}
        </Card>
      </div>
    </>
  );
}
