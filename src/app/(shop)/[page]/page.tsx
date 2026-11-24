import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import PageBanner from '@/components/layout/PageBanner';

type Page = { slug: string; title: string; body: string; meta_description: string | null };
type Props = { params: Promise<{ page: string }> };

const getPage = async (slug: string) => (await db().prepare('SELECT * FROM pages WHERE slug = ?').get(slug)) as Page | undefined;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPage((await params).page);
  if (!p) return {};
  return { title: p.title, description: p.meta_description ?? undefined, alternates: { canonical: `/${p.slug}` }, robots: p.body ? undefined : { index: false } };
}

/** Content pages (About, FAQ, policies, locations) edited in Admin → Pages. Body is plain text; blank lines make paragraphs. */
export default async function ContentPage({ params }: Props) {
  const p = await getPage((await params).page);
  if (!p) notFound();
  const s = (await getSettings());
  return (
    <>
      <PageBanner title={p.title} crumbs={[{ name: p.title }]} />
      <div className="container-kk mt-8 max-w-[900px]">
        {p.body ? <div className="prose-kk">{renderBody(p.body)}</div> : (
          <p className="py-6">This page is being updated. For any question, contact us at {s.contact.phone.join(' / ')} or {s.contact.email[0]}.</p>
        )}
      </div>
    </>
  );
}

/** Plain-text page body: blank line = paragraph, "# " = heading, "- " lines = list. */
function renderBody(body: string) {
  return body.trim().split(/\n\s*\n/).map((block, i) => {
    const lines = block.split('\n').map((l) => l.trim());
    if (lines[0].startsWith('# ')) return <h2 key={i}>{lines[0].slice(2)}</h2>;
    if (lines.every((l) => l.startsWith('- '))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
    return <p key={i}>{lines.map((l, j) => <span key={j}>{j > 0 && <br />}{l}</span>)}</p>;
  });
}
