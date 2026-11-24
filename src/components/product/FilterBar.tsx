'use client';
import { useT } from '@/components/i18n/LangProvider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from '@/components/icons';

const SORTS = [['price-asc', 'Price: low to high'], ['latest', 'Newest'], ['price-desc', 'Price: high to low'], ['discount', 'Biggest discount']];

/** Sorting dropdown + availability filter (FilterSidebar/SortingDropdown). State lives in the URL so results are shareable. */
export default function FilterBar({ count, sort, inStockOnly }: { count: number; sort: string; inStockOnly: boolean }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false });
  };
  return (
    <div className="mb-8 grid grid-cols-2 items-center gap-3 rounded-2xl border border-line bg-paper p-3 pl-4 shadow-[0_10px_30px_-20px_rgba(53,34,24,.35)] sm:mb-10 sm:flex sm:justify-between sm:gap-4 sm:rounded-full sm:px-7 sm:py-2.5">
      <span className="text-[15px] text-muted"><strong className="font-display text-[20px] font-normal text-ink">{count}</strong> {t(count === 1 ? 'piece' : 'pieces')}</span>
      <div className="contents text-[14px] text-ink-2 sm:flex sm:items-center sm:gap-x-6">
        <label className="flex cursor-pointer items-center gap-2.5 justify-self-end text-[14px] text-ink-2 select-none">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => set('stock', e.target.checked ? 'in' : null)} className="peer sr-only" />
          <span aria-hidden className="relative h-5 w-9 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-gold-dark peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
          {t('In stock only')}
        </label>
        <span aria-hidden className="hidden h-5 w-px bg-line sm:block" />
        <label className="col-span-2 flex items-center gap-3 border-t border-line pt-3 sm:border-0 sm:pt-0">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{t('Sort')}</span>
          <span className="relative flex-1 sm:flex-none">
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'price-asc' ? null : e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-full border border-line bg-cream py-1.5 pl-4 pr-9 text-[14px] text-ink transition-colors hover:border-gold focus:border-gold focus:outline-none">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{t(l)}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-dark" />
          </span>
        </label>
      </div>
    </div>
  );
}
