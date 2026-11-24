import Link from 'next/link';
import { ArrowRight } from '@/components/icons';

export type Crumb = { name: string; href?: string };

/** Gradient title band with breadcrumbs, used on every inner page (CategoryBanner + Breadcrumbs on the reference). */
export default function PageBanner({ title, crumbs }: { title: string; crumbs: Crumb[] }) {
  const all: Crumb[] = [{ name: 'Home', href: '/' }, ...crumbs];
  return (
    <div className="page-banner text-sand">
      <div className="container-kk flex flex-col items-center gap-3 py-10 text-center md:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap justify-center gap-1.5 text-[12px] uppercase tracking-[0.2em]">
            {all.map((c, i) => (
              <li key={i} className="flex gap-1">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:underline">{c.name}</Link> : <span aria-current={i === all.length - 1 ? 'page' : undefined}>{c.name}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="font-display text-[34px] text-white md:text-[46px]">{title}</h1>
      </div>
    </div>
  );
}

/** Grey heading bar with an arrow link, used above each product group. */
export function SectionBar({ title, href, as: Tag = 'h2' }: { title: string; href?: string; as?: 'h2' | 'h3' }) {
  return (
    <div className="section-bar mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
      <Tag className="font-display text-[26px] text-ink md:text-[34px]">{href ? <Link href={href} className="hover:text-gold">{title}</Link> : title}</Tag>
      {href && <Link href={href} aria-label={`View all ${title}`} className="inline-flex shrink-0 items-center gap-2 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink hover:text-gold">View all <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}

export function breadcrumbJsonLd(base: string, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', href: '/' }, ...crumbs].map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href ? { item: base + c.href } : {}),
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so catalogue text cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
