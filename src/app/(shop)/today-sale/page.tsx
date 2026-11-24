import { getT } from '@/lib/lang';
import type { Metadata } from 'next';
import Link from 'next/link';
import { saleProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { ProductGrid } from '@/components/product/ProductCard';
import Countdown from '@/components/layout/Countdown';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.sale_title, description: s.sale_headline || undefined, alternates: { canonical: '/today-sale' } };
}

export default async function TodaySalePage() {
  const s = await getSettings();
  const products = await saleProducts();
  const t = await getT();
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-sand">
        {s.sale_banner && <img src={s.sale_banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
        <div className="container-kk relative flex flex-col items-center gap-4 py-14 text-center md:py-20">
          <nav aria-label="Breadcrumb" className="text-[12px] uppercase tracking-[0.2em]"><Link href="/" className="hover:underline">{t('Home')}</Link> / <span aria-current="page">{s.sale_title}</span></nav>
          <span className="rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white" style={{ background: s.sale_color }}>{products.length} {t('pieces on sale')}</span>
          <h1 className="font-display text-[38px] leading-tight text-white md:text-[56px]">{s.sale_headline || s.sale_title}</h1>
          {s.sale_text && <p className="max-w-xl text-[16px] text-sand/90">{s.sale_text}</p>}
          {s.sale_ends_at && <Countdown to={s.sale_ends_at} className="mt-2 text-white" />}
        </div>
      </section>
      <div className="container-kk mt-8">
        {products.length ? <ProductGrid products={products} sale={{ title: s.sale_title, color: s.sale_color }} eager={4} />
          : <p className="py-10 text-center">{t('No sale products right now.')}</p>}
      </div>
    </>
  );
}
