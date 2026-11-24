import { T } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { imageUrl, type ProductRow } from '@/lib/catalog';
import { discountPercent, unitPrice } from '@/lib/pricing';
import { AddToBag, BuyNow, WishlistButton } from './CartButtons';

export function SaleBadge({ title, color }: { title: string; color: string }) {
  return <span className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white sm:px-3 sm:text-[10px] sm:tracking-[0.2em]" style={{ background: color }}>{title}</span>;
}

export function DiscountBadge({ percent }: { percent: number }) {
  if (!percent) return null;
  return <span className="ml-2 bg-ink px-1.5 py-0.5 text-[10px] sm:ml-3 sm:px-2 sm:py-1 sm:text-[11px] font-semibold tracking-[0.06em] text-sand">−{percent}%</span>;
}

export function PriceDisplay({ price, sale }: { price: number; sale: number | null }) {
  const now = unitPrice({ price, sale_price: sale });
  return (
    <span className="inline-flex items-baseline justify-center gap-2.5">
      <strong className={`text-[17px] font-semibold tracking-[0.02em] ${now < price ? 'text-sale' : 'text-ink'}`}>Rs {now.toLocaleString()}</strong>
      {now < price && <del className="text-[14px] text-muted">Rs {price.toLocaleString()}</del>}
    </span>
  );
}

export function cartItemOf(p: ProductRow) {
  return { id: p.id, alias: p.alias, title: p.title, code: p.code, img: imageUrl(p.img, 'product', '100x100_cover'), price: unitPrice(p) };
}

export default function ProductCard({ p, sale, priority = false }: { p: ProductRow; sale: { title: string; color: string }; priority?: boolean }) {
  const [sku, ...colour] = (p.code ?? '').split(' ');
  const item = cartItemOf(p);
  return (
    <article className="group flex w-full flex-col">
      <div className="relative overflow-hidden bg-soft ring-1 ring-line transition-shadow duration-500 group-hover:shadow-[0_18px_40px_-18px_rgba(53,34,24,.35)]">
        <div className="absolute left-0 top-3 z-[1] flex flex-col items-start gap-1.5 sm:top-4 sm:gap-2">
          {p.on_sale === 1 && <SaleBadge title={sale.title} color={sale.color} />}
          <DiscountBadge percent={discountPercent(p)} />
        </div>
        <div className="absolute right-2 top-2 z-[1] sm:right-3 sm:top-3"><WishlistButton id={p.id} /></div>
        <Link href={`/product/${p.alias}`} className="block aspect-square">
          <img src={imageUrl(p.img, 'product', '600x600_cover')} alt={`${p.title} ${p.code ?? ''}`.trim()} width={600} height={600}
            loading={priority ? 'eager' : 'lazy'} decoding="async" className={`h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] ${p.in_stock ? '' : 'opacity-50 grayscale'}`} />
          {!p.in_stock && (
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white"><T>Sold Out</T></span>
          )}
        </Link>
        {p.in_stock === 1 && <div className="absolute bottom-2 right-2 z-[1] sm:bottom-3 sm:right-3"><AddToBag item={item} /></div>}
      </div>
      <div className="mt-3 flex-1 text-center sm:mt-5">
        {p.code && (
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gold sm:text-[11px] sm:tracking-[0.2em]">
            {sku}{colour.length > 0 && <span className="text-muted"> · {colour.join(' ')}</span>}
          </p>
        )}
        <h3 className="mt-1 font-display text-[17px] leading-snug text-ink sm:text-[21px]">
          <Link href={`/product/${p.alias}`} className="transition-colors hover:text-gold-dark">{p.title}</Link>
        </h3>
        <span aria-hidden className="mx-auto my-2.5 block h-px w-8 bg-sand" />
        <PriceDisplay price={p.price} sale={p.sale_price} />
      </div>
      {p.in_stock === 1 && <div className="mt-3 sm:mt-5"><BuyNow item={item} /></div>}
    </article>
  );
}

export function ProductGrid({ products, sale, eager = 0 }: { products: ProductRow[]; sale: { title: string; color: string }; eager?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => <ProductCard key={p.id} p={p} sale={sale} priority={i < eager} />)}
    </div>
  );
}
