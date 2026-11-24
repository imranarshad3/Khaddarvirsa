import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import Link from 'next/link';
import PageBanner from '@/components/layout/PageBanner';
import HelpNav from '@/components/layout/HelpNav';
import { whatsappLink } from '@/lib/settings';
import { PhoneIcon, WhatsappIcon } from '@/components/icons';

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
  const t = await getT();
  return (
    <>
      <PageBanner title={p.title} crumbs={[{ name: p.title }]} />
      <div className="container-kk mt-10 grid gap-8 md:mt-14 lg:grid-cols-[1fr_300px]">
        <article className="rounded-[26px] border border-line bg-white p-6 shadow-[0_24px_60px_-44px_rgba(53,34,24,.5)] sm:p-10">
          {p.body ? <div className="prose-kk">{renderBody(p.body)}</div> : (
            // No text yet: say so honestly and offer the fastest ways to get an answer.
            <div className="py-6 text-center">
              <p className="font-display text-[28px] text-ink">{t('This page is coming soon')}</p>
              <p className="mx-auto mt-3 max-w-[460px] text-[16px]">{t('We are writing it now. Until then, our team will happily answer any question directly.')}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {s.whatsapp_number && <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="btn-dark rounded-full"><WhatsappIcon className="h-4 w-4" /> {t('WhatsApp us')}</a>}
                {s.contact.phone[0] && <a href={`tel:+${s.contact.phone[0].replace(/\D/g, '')}`} className="btn-line rounded-full"><PhoneIcon className="h-4 w-4" /> {t('Call')} {s.contact.phone[0]}</a>}
              </div>
              <Link href="/contact" className="mt-6 inline-block text-[14px] text-gold underline-offset-4 hover:underline">{t('All contact options')}</Link>
            </div>
          )}
        </article>
        <aside className="lg:sticky lg:top-28 lg:self-start"><HelpNav current={`/${p.slug}`} /></aside>
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
