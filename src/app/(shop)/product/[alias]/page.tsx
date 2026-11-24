import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { imageUrl, productByAlias, relatedProducts } from '@/lib/catalog';
import { getSettings, siteUrl } from '@/lib/settings';
import { discountPercent, unitPrice } from '@/lib/pricing';
import { SectionBar, JsonLd, breadcrumbJsonLd } from '@/components/layout/PageBanner';
import { ProductGrid, cartItemOf } from '@/components/product/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import { ProductActions } from '@/components/product/CartButtons';
import { CheckIcon, ChevronDown, TruckIcon } from '@/components/icons';
import PaymentLogos from '@/components/PaymentLogos';

type Props = { params: Promise<{ alias: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = (await productByAlias((await params).alias));
  if (!p) return {};
  const title = p.meta_title || `${p.title} ${p.code ?? ''}`.trim();
  const price = unitPrice(p);
  const description = p.meta_description || p.description.split('\n')[0].slice(0, 160)
    || `${title}: Rs ${price.toLocaleString()} at ${(await getSettings()).store_name}. Cash on Delivery across Pakistan.`;
  const img = imageUrl(p.img, 'product');
  return { title, description, alternates: { canonical: `/product/${p.alias}` }, openGraph: { title, description, images: [img], type: 'website' }, twitter: { card: 'summary_large_image', images: [img] } };
}

function youtubeId(url: string | null) {
  return url?.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? null;
}

export default async function ProductPage({ params }: Props) {
  const p = (await productByAlias((await params).alias));
  if (!p) notFound();
  const s = (await getSettings());
  const price = unitPrice(p);
  const off = discountPercent(p);
  const freeShip = s.free_shipping_over > 0 && price >= s.free_shipping_over;
  const related = (await relatedProducts(p));
  const base = siteUrl();
  const crumbs = [
    { name: p.cat_name, href: `/main-category/${p.cat_alias}` },
    { name: p.sub_name, href: `/product-category/${p.sub_alias}` },
    { name: `${p.title} ${p.code ?? ''}`.trim() },
  ];
  // Description: first block is prose, lines starting with a bullet become a list.
  const lines = p.description.split('\n').map((l) => l.trim()).filter(Boolean);
  const prose = lines.filter((l) => !/^[•\-*]/.test(l));
  const bullets = lines.filter((l) => /^[•\-*]/.test(l)).map((l) => l.replace(/^[•\-*]\s*/, ''));

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: `${p.title} ${p.code ?? ''}`.trim(), sku: p.code ?? String(p.id),
        image: [imageUrl(p.img, 'product')], description: p.description, category: p.sub_name, brand: { '@type': 'Brand', name: s.store_name },
        offers: {
          '@type': 'Offer', url: `${base}/product/${p.alias}`, priceCurrency: 'PKR', price,
          availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', itemCondition: 'https://schema.org/NewCondition',
        },
      }} />
      <JsonLd data={breadcrumbJsonLd(base, crumbs.slice(0, 2))} />
      <nav aria-label="Breadcrumb" className="border-b border-line bg-paper">
        <ol className="container-kk flex flex-wrap items-center gap-2 py-4 text-[12px] uppercase tracking-[0.18em] text-muted">
          {[{ name: 'Home', href: '/' }, ...crumbs].map((c, i, all) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-line">/</span>}
              {'href' in c && c.href && i < all.length - 1
                ? <Link href={c.href} className="transition-colors hover:text-gold-dark">{c.name}</Link>
                : <span aria-current="page" className="text-ink">{c.name}</span>}
            </li>
          ))}
        </ol>
      </nav>

      <div className="container-kk grid gap-10 py-10 md:grid-cols-2 md:py-14 lg:gap-16">
        <div className="md:sticky md:top-[190px] md:self-start">
          <ProductGallery image={imageUrl(p.img, 'product')} alt={`${p.title} ${p.code ?? ''}`.trim()} youtubeId={youtubeId(p.youtube_link)} />
        </div>

        <div>
          <Link href={`/product-category/${p.sub_alias}`} className="eyebrow hover:text-ink">{p.sub_name}</Link>
          <h1 className="font-display mt-3 text-[36px] leading-[1.1] text-ink sm:text-[46px]">{p.title}</h1>
          {p.code && <p className="mt-3 text-[13px] uppercase tracking-[0.2em] text-muted">Code · <span className="text-ink-2">{p.code}</span></p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-y border-line py-5">
            <span className="font-display text-[34px] leading-none text-ink">Rs {price.toLocaleString()}</span>
            {off > 0 && <del className="text-[18px] text-muted">Rs {p.price.toLocaleString()}</del>}
            {off > 0 && <span className="rounded-full bg-sale/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-sale">Save Rs {(p.price - price).toLocaleString()} · {off}%</span>}
          </div>

          <p className="mt-5 flex items-center gap-2.5 text-[15px]">
            <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${p.in_stock ? 'bg-green-600 shadow-[0_0_0_4px_rgba(22,163,74,.15)]' : 'bg-sale'}`} />
            {p.in_stock ? <span className="font-medium text-green-800">In stock, ready to ship</span> : <span className="font-medium text-sale">Out of stock</span>}
          </p>

          <div className="mt-6">
            {p.in_stock ? <ProductActions item={cartItemOf(p)} />
              : <p className="rounded-full border border-line py-4 text-center text-[13px] font-semibold uppercase tracking-[0.2em] text-muted">Currently unavailable</p>}
          </div>

          <ul className="mt-8 grid gap-3 rounded-2xl bg-soft p-5 text-[15px] text-ink-2 sm:grid-cols-2">
            <li className="flex items-start gap-3"><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-gold-dark" /> Cash on Delivery across Pakistan</li>
            <li className="flex items-start gap-3"><TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
              {freeShip ? 'Free delivery on this piece'
                : s.free_shipping_over > 0 ? `Free delivery on orders over Rs ${s.free_shipping_over.toLocaleString()}`
                : s.shipping_charges > 0 ? `Delivery Rs ${s.shipping_charges.toLocaleString()}` : 'Delivered to your door'}
            </li>
          </ul>

          <details open className="group mt-8 border-t border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[13px] font-semibold uppercase tracking-[0.22em] text-ink">
              Description <ChevronDown className="h-4 w-4 text-gold-dark transition-transform group-open:rotate-180" />
            </summary>
            <div className="pb-6">
              {prose.map((l, i) => <p key={i} className="mb-3 text-[16px] leading-[1.8] text-body">{l}</p>)}
              {bullets.length > 0 && (
                <ul className="mt-4 grid gap-2">
                  {bullets.map((b, i) => <li key={i} className="flex gap-3 text-[15px] text-ink-2"><span aria-hidden className="mt-[11px] h-px w-4 shrink-0 bg-gold" />{b}</li>)}
                </ul>
              )}
            </div>
          </details>
          <div className="border-t border-line pt-6"><PaymentLogos /></div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-kk mb-20 mt-6">
          <SectionBar title="Related Products" href={`/product-category/${p.sub_alias}`} />
          <ProductGrid products={related} sale={{ title: s.sale_title, color: s.sale_color }} scroll />
        </section>
      )}
    </>
  );
}
