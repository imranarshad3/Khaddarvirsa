import type { Metadata } from 'next';
import Link from 'next/link';
import { navigation, searchProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { ProductGrid } from '@/components/product/ProductCard';
import { SearchIcon, ArrowRight } from '@/components/icons';

export const metadata: Metadata = { title: 'Search', robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 60);
  const [s, cats, found] = await Promise.all([getSettings(), navigation(), q ? searchProducts(q) : null]);
  const products = found?.products ?? [];
  const links = [...(s.sale_enabled ? [{ name: s.sale_title, href: '/today-sale' }] : []), ...cats.map((c) => ({ name: c.name, href: `/main-category/${c.alias}` }))];
  const chips = (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      {links.map((l) => <Link key={l.href} href={l.href} className="rounded-full border border-line bg-white px-4 py-2 text-[13px] text-ink-2 transition hover:border-ink hover:bg-ink hover:text-sand">{l.name}</Link>)}
    </div>
  );

  return (
    <>
      <section className="page-banner text-sand">
        <div className="container-kk py-10 text-center md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sand/80">Search the collection</p>
          <h1 className="font-display mt-2 text-[30px] text-white md:text-[42px]">{q ? <>Results for “{q}”</> : 'What are you looking for?'}</h1>
          <form action="/search" role="search" className="relative mx-auto mt-6 max-w-[560px]">
            <label htmlFor="search-page" className="sr-only">Search products</label>
            <input id="search-page" name="q" type="search" defaultValue={q} placeholder="Colour, fabric or product code" enterKeyHint="search"
              className="w-full rounded-full border border-white/20 bg-white py-3.5 pl-12 pr-32 text-[16px] text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-gold/30" />
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-sand hover:bg-ink-2">Search</button>
          </form>
        </div>
      </section>

      <div className="container-kk mt-8">
        {!q ? (
          <div className="py-8 text-center">
            <p className="text-[15px] text-muted">Search by name, colour or code, for example “brown”, “boski” or “ASW-52”. Or browse:</p>
            {chips}
          </div>
        ) : products.length ? (
          <>
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <p className="text-[14px] text-muted"><strong className="font-semibold text-ink">{products.length}{products.length === 60 ? '+' : ''}</strong> {products.length === 1 ? 'piece' : 'pieces'} found</p>
              {found?.partial && <p className="rounded-full bg-soft px-3 py-1 text-[12px] text-ink-2">No exact match. Showing the closest pieces.</p>}
            </div>
            <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} />
          </>
        ) : (
          <div className="mx-auto max-w-[520px] py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-soft text-gold-dark"><SearchIcon className="h-6 w-6" /></span>
            <h2 className="font-display mt-4 text-[24px] text-ink">No pieces match “{q}”</h2>
            <p className="mt-2 text-[15px] text-muted">Check the spelling, try fewer words, or browse a collection.</p>
            {chips}
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-dark hover:text-ink">Ask us about a piece <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        )}
      </div>
    </>
  );
}
