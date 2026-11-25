'use client';
import { useT } from '@/components/i18n/LangProvider';
import { useCart } from '@/components/cart/CartProvider';
import { BagIcon } from '@/components/icons';
import type { ReorderItem } from '@/lib/customer';

export default function ReorderButton({ items }: { items: ReorderItem[] }) {
  const t = useT();
  const { add, setDrawerOpen } = useCart();
  if (!items.length) return <span className="text-[13px] text-muted">{t('These items are no longer available.')}</span>;
  return (
    <button type="button" onClick={() => { items.forEach(({ qty, ...item }) => add(item, qty)); setDrawerOpen(true); }}
      className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white">
      <BagIcon className="h-4 w-4" /> {t('Order again')}
    </button>
  );
}
