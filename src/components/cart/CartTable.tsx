'use client';
import { useT } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { useCart } from './CartProvider';
import QuantitySelector from './QuantitySelector';
import type { Quote } from './useQuote';
import { rs } from '@/lib/pricing';
import { CloseIcon } from '@/components/icons';

export function CartTable({ quote }: { quote: Quote | null }) {
  const t = useT();
  const { items, setQty, remove } = useCart();
  const unavailable = new Set(quote?.lines.filter((l) => !l.available).map((l) => l.id));
  return (
    <ul className="divide-y divide-line rounded-[24px] border border-line bg-white px-4 md:px-6">
      {items.map((i) => (
        <li key={i.id} className="flex gap-4 py-5">
          <Link href={`/product/${i.alias}`} className="shrink-0"><img src={i.img} alt="" width={88} height={110} className="h-[110px] w-[88px] rounded-2xl object-cover" /></Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 leading-tight">
                <Link href={`/product/${i.alias}`} className="line-clamp-2 text-[15px] font-semibold text-ink hover:text-gold-dark">{i.title}</Link>
                <p className="mt-1 text-[12px] text-muted">{i.code}</p>
              </div>
              <button type="button" onClick={() => remove(i.id)} aria-label={`${t('Remove')} ${i.title}`} className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-soft hover:text-sale"><CloseIcon className="h-4 w-4" /></button>
            </div>
            {unavailable.has(i.id) && <p className="mt-2 text-[13px] font-semibold text-sale">{t('Sold out. Please remove it to continue.')}</p>}
            <div className="mt-auto flex items-end justify-between gap-3 pt-3">
              <QuantitySelector value={i.qty} onChange={(q) => setQty(i.id, q)} />
              <div className="text-right leading-tight">
                <p className="text-[16px] font-semibold text-ink">{rs(i.price * i.qty)}</p>
                {i.qty > 1 && <p className="text-[12px] text-muted">{rs(i.price)} {t('each')}</p>}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TotalsTable({ quote }: { quote: Quote | null }) {
  const t = useT();
  if (!quote) return <div className="space-y-3 py-2" aria-label={t('Calculating…')}>{[0, 1, 2].map((k) => <div key={k} className="h-4 animate-pulse rounded bg-soft" />)}</div>;
  const left = quote.freeShippingOver > 0 && quote.shipping > 0 ? quote.freeShippingOver - quote.subtotal : 0;
  return (
    <dl className="space-y-2.5 text-[14px]">
      <div className="flex justify-between"><dt className="text-muted">{t('Subtotal')}</dt><dd>{rs(quote.subtotal)}</dd></div>
      {quote.discount > 0 && <div className="flex justify-between text-sale"><dt>{t('Discount')}</dt><dd>− {rs(quote.discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-muted">{t('Shipping')}</dt><dd>{quote.shipping ? rs(quote.shipping) : t('Free')}</dd></div>
      {left > 0 && <p className="rounded-xl bg-gold/10 px-3 py-2 text-[13px] text-gold-dark">{t('Add')} {rs(left)} {t('more for free shipping.')}</p>}
      <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="font-semibold text-ink">{t('Total')}</dt><dd className="font-display text-[24px] text-ink">{rs(quote.total)}</dd></div>
    </dl>
  );
}
