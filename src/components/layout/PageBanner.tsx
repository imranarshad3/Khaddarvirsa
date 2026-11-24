import { T } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { ArrowRight } from '@/components/icons';

export type Crumb = { name: string; href?: string };

/** Gradient title band with breadcrumbs, used on every inner page (CategoryBanner + Breadcrumbs on the reference). */
export default function PageBanner({ title, crumbs, subtitle }: { title: string; crumbs: Crumb[]; subtitle?: string }) {
  const all: Crumb[] = [{ name: 'Home', href: '/' }, ...crumbs];
  return (
    <div className="page-banner relative overflow-hidden text-sand">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#d4b289_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="container-kk relative flex flex-col items-center gap-3 py-10 text-center md:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap justify-center gap-1.5 text-[12px] uppercase tracking-[0.2em]">
            {all.map((c, i) => (
              <li key={i} className="flex gap-1">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:underline"><T>{c.name}</T></Link> : <span aria-current={i === all.length - 1 ? 'page' : undefined}><T>{c.name}</T></span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="font-display text-[34px] text-white md:text-[46px]"><T>{title}</T></h1>
        <span aria-hidden="true" className="flex items-center gap-3 text-sand/70"><span className="h-px w-10 bg-sand/40" /><span className="h-1.5 w-1.5 rotate-45 bg-sand" /><span className="h-px w-10 bg-sand/40" /></span>
        {subtitle && <p className="max-w-[560px] text-[15px] leading-relaxed text-sand/80"><T>{subtitle}</T></p>}
      </div>
    </div>
  );
}

/** Grey heading bar with an arrow link, used above each product group. */
export function SectionBar({ title, href, as: Tag = 'h2' }: { title: string; href?: string; as?: 'h2' | 'h3' }) {
  return (
    <div className="section-bar mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
      <Tag className="font-display text-[26px] text-ink md:text-[34px]">{href ? <Link href={href} className="hover:text-gold"><T>{title}</T></Link> : <T>{title}</T>}</Tag>
      {href && <Link href={href} className="inline-flex shrink-0 items-center gap-2 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink hover:text-gold"><T>View all</T><span className="sr-only"> {title}</span> <ArrowRight className="h-4 w-4" /></Link>}
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
