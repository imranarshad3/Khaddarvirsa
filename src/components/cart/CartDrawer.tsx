'use client';
import { useT } from '@/components/i18n/LangProvider';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { BagIcon, CheckIcon, CloseIcon } from '@/components/icons';
import QuantitySelector from './QuantitySelector';
import { rs } from '@/lib/pricing';
import { useDialog } from '@/components/useDialog';

export function CartButton() {
  const t = useT();
  const { count, ready, setDrawerOpen } = useCart();
  return (
    <button type="button" onClick={() => setDrawerOpen(true)} aria-label={`${t('Open cart')}: ${count}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft hover:text-gold-dark">
      <BagIcon className="h-5 w-5" />
      {ready && count > 0 && (
        <span className="absolute right-0.5 top-0.5 min-w-[18px] rounded-full bg-gold-dark px-1 text-center text-[11px] font-bold leading-[18px] text-white ring-2 ring-paper">{count}</span>
      )}
    </button>
  );
}

export function CartToast() {
  const t = useT();
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div role="status" className="fixed inset-x-4 bottom-20 z-[60] flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[15px] text-white shadow-lg sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4" style={{ animation: 'kk-fade .2s' }}>
      <CheckIcon /> {t(toast)}
    </div>
  );
}

export default function CartDrawer() {
  const { items, count, drawerOpen, setDrawerOpen, setQty, remove, subtotal } = useCart();
  const t = useT();
  const pathname = usePathname();
  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);
  const panel = useDialog<HTMLElement>(drawerOpen, () => setDrawerOpen(false));
  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" style={{ animation: 'kk-fade-in .2s' }} onClick={() => setDrawerOpen(false)} />
      <aside ref={panel} className="absolute inset-y-0 right-0 flex w-[420px] max-w-[92vw] flex-col bg-cream shadow-[-24px_0_60px_-30px_rgba(53,34,24,.6)]" style={{ animation: 'kk-slide-left .25s ease-out' }}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id="cart-title" className="font-display text-[24px]">{t('Your Bag')}{count > 0 && <span className="ml-2 align-middle font-sans text-[13px] font-semibold tracking-[0.12em] text-muted">({count})</span>}</h2>
          <button type="button" aria-label={t('Close cart')} onClick={() => setDrawerOpen(false)}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-soft"><CloseIcon className="h-5 w-5" /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-soft text-gold-dark"><BagIcon className="h-7 w-7" /></span>
            <p className="font-display text-[22px] text-ink">{t('Your bag is empty')}</p>
            <p className="text-[15px]">{t('Browse our handwoven khaddar and add a suit you like.')}</p>
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-dark mt-2">{t('Continue shopping')}</button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 px-4 py-4">
                <img src={i.img} alt="" width={72} height={88} className="h-[88px] w-[72px] shrink-0 rounded-lg object-cover ring-1 ring-line" />
                <div className="min-w-0 flex-1 leading-tight">
                  <Link href={`/product/${i.alias}`} className="block font-display text-[17px] text-ink hover:text-gold-dark">{i.title}</Link>
                  {i.code && <span className="mt-0.5 block text-[12px] uppercase tracking-[0.12em] text-muted">{i.code}</span>}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantitySelector value={i.qty} onChange={(q) => setQty(i.id, q)} />
                    <span className="text-[15px] font-semibold text-ink">{rs(i.price * i.qty)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => remove(i.id)} aria-label={`${t('Remove')} ${i.title}`}
                  className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-sale"><CloseIcon className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="border-t border-line bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="mb-1 flex justify-between text-[16px] text-ink"><span>{t('Subtotal')}</span><strong>{rs(subtotal)}</strong></div>
            <p className="mb-4 text-[13px] text-muted">{t('Delivery and discounts are worked out at checkout. Cash on Delivery.')}</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart-detail" className="btn-line !px-2">{t('View cart')}</Link>
              <Link href="/checkout" className="btn-dark !px-2">{t('Checkout')}</Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
