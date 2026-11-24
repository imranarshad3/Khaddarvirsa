'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from '@/components/icons';

const SORTS = [['price-asc', 'Price: low to high'], ['latest', 'Newest'], ['price-desc', 'Price: high to low'], ['discount', 'Biggest discount']];

/** Sorting dropdown + availability filter (FilterSidebar/SortingDropdown). State lives in the URL so results are shareable. */
export default function FilterBar({ count, sort, inStockOnly }: { count: number; sort: string; inStockOnly: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const set = (k: string, v: string | null) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${pathname}${p.size ? `?${p}` : ''}`, { scroll: false });
  };
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-full border border-line bg-paper px-5 py-2.5 shadow-[0_10px_30px_-20px_rgba(53,34,24,.35)] sm:px-7">
      <span className="text-[15px] text-muted"><strong className="font-display text-[20px] font-normal text-ink">{count}</strong> piece{count === 1 ? '' : 's'}</span>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-ink-2">
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => set('stock', e.target.checked ? 'in' : null)} className="peer sr-only" />
          <span aria-hidden className="relative h-5 w-9 rounded-full bg-line transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-gold-dark peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
          In stock only
        </label>
        <span aria-hidden className="hidden h-5 w-px bg-line sm:block" />
        <label className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">Sort</span>
          <span className="relative">
            <select value={sort} onChange={(e) => set('sort', e.target.value === 'price-asc' ? null : e.target.value)}
              className="cursor-pointer appearance-none rounded-full border border-line bg-cream py-1.5 pl-4 pr-9 text-[14px] text-ink transition-colors hover:border-gold focus:border-gold focus:outline-none">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-dark" />
          </span>
        </label>
      </div>
    </div>
  );
}
