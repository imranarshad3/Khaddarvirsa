'use client';
import { useT } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { useQuote } from '@/components/cart/useQuote';
import { CartTable, TotalsTable } from '@/components/cart/CartTable';
import { ArrowRight, BagIcon, TruckIcon } from '@/components/icons';
import { rs } from '@/lib/pricing';

export default function CartPage() {
  const t = useT();
  const { items, ready } = useCart();
  const quote = useQuote();
  const blocked = quote?.lines.some((l) => !l.available);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return (
    <div className="container-kk py-8 md:py-14">
      <title>{t('Shopping Bag')}</title>
      <meta name="robots" content="noindex" />
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-dark">{t('Your bag')}</p>
          <h1 className="font-display mt-1 text-[30px] leading-tight text-ink md:text-[40px]">{t('Shopping Bag')}{ready && count > 0 && <span className="ml-2 align-middle text-[16px] text-muted">({count})</span>}</h1>
        </div>
        {ready && items.length > 0 && <Link href="/" className="hidden text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-2 underline-offset-4 hover:underline sm:block">{t('Continue shopping')}</Link>}
      </div>
      {!ready ? <div className="h-40 animate-pulse rounded-[24px] bg-soft" /> : items.length === 0 ? (
        <div className="mx-auto max-w-[460px] rounded-[28px] border border-line bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-soft text-ink-2"><BagIcon className="h-7 w-7" /></span>
          <h2 className="font-display mt-5 text-[26px] text-ink">{t('Your bag is empty')}</h2>
          <p className="mt-2 text-[15px] text-muted">{t('Pieces you add will wait for you here.')}</p>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand transition hover:bg-ink-2">{t('Start shopping')} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="grid gap-6 pb-24 md:grid-cols-[1fr_380px] md:pb-0">
          <CartTable quote={quote} />
          <aside className="h-fit rounded-[24px] border border-line bg-white p-6 md:sticky md:top-28">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">{t('Summary')}</p>
            <TotalsTable quote={quote} />
            {blocked && <p className="mt-4 rounded-xl bg-sale/5 px-3 py-2 text-[13px] text-sale">{t('Remove sold-out items to continue.')}</p>}
            <p className="mt-4 flex items-center gap-2 text-[13px] text-muted"><TruckIcon className="h-4 w-4 text-gold-dark" /> {t('Cash on delivery available nationwide')}</p>
            {/* Phones: checkout button sticks to the bottom so it is always in reach. */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur md:static md:mt-5 md:border-0 md:bg-transparent md:p-0">
              {blocked || !quote
                ? <span className="flex w-full items-center justify-center rounded-full bg-ink/40 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand">{t(quote ? 'Checkout unavailable' : 'Calculating…')}</span>
                : <Link href="/checkout" className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand transition hover:bg-ink-2">{t('Checkout')} · {rs(quote.total)} <ArrowRight className="h-4 w-4" /></Link>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
