'use client';
import { useT } from '@/components/i18n/LangProvider';
import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchSuggest } from '@/app/actions';
import { SearchIcon, CloseIcon, ArrowRight } from '@/components/icons';
import { rs } from '@/lib/pricing';

type Result = Awaited<ReturnType<typeof searchSuggest>>;
export type QuickLink = { name: string; href: string };

/** Header search: live product suggestions with keyboard support; Enter opens the full results page. */
export default function SearchOverlay({ dark = false, quick = [] }: { dark?: boolean; quick?: QuickLink[] }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [done, setDone] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const box = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const term = q.trim();
  const loading = term.length >= 2 && done !== q;
  const hits = done === q ? res?.hits ?? [] : [];

  useEffect(() => {
    setActive(-1);
    if (term.length < 2) { setRes(null); setDone(q); return; }
    let live = true;
    const t = setTimeout(() => searchSuggest(q).then((r) => { if (live) { setRes(r); setDone(q); } }), 180);
    return () => { live = false; clearTimeout(t); };
  }, [q, term.length]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (href: string) => { setOpen(false); input.current?.blur(); router.push(href); };
  const all = `/search?q=${encodeURIComponent(term)}`;

  return (
    <form ref={box} role="search" className="relative"
      onSubmit={(e) => { e.preventDefault(); if (active >= 0 && hits[active]) go(`/product/${hits[active].alias}`); else if (term) go(all); }}>
      <label htmlFor={dark ? 'search-m' : 'search-d'} className="sr-only">{t('Search products')}</label>
      <input ref={input} id={dark ? 'search-m' : 'search-d'} type="search" value={q} placeholder={t('Search khaddar, shawls, codes…')} autoComplete="off" enterKeyHint="search"
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setOpen(false); input.current?.blur(); }
          else if (e.key === 'ArrowDown' && hits.length) { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % hits.length); }
          else if (e.key === 'ArrowUp' && hits.length) { e.preventDefault(); setActive((a) => (a <= 0 ? hits.length - 1 : a - 1)); }
        }}
        className="w-full rounded-full border border-line bg-white/70 py-2.5 pl-11 pr-10 text-[15px] text-ink-2 outline-none transition placeholder:text-muted focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 [&::-webkit-search-cancel-button]:hidden" />
      <button type="submit" aria-label={t('Search')} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"><SearchIcon className="h-[18px] w-[18px]" /></button>
      {loading ? <span aria-hidden className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        : q && <button type="button" aria-label={t('Clear search')} onClick={() => { setQ(''); input.current?.focus(); }} className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"><CloseIcon className="h-3.5 w-3.5" /></button>}

      {open && (term.length < 2 ? quick.length > 0 : done === q) && (
        <div id={listId} className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_50px_-20px_rgba(53,34,24,.35)] sm:min-w-[380px]" style={{ animation: 'kk-fade .15s' }}>
          {term.length < 2 ? (
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{t('Popular')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quick.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-2 transition hover:border-ink hover:bg-ink hover:text-sand">{l.name}</Link>)}
              </div>
            </div>
          ) : hits.length ? (
            <>
              <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{t(res?.partial ? 'Closest matches' : 'Products')}</p>
              <ul role="listbox" aria-label={t('Suggestions')} className="max-h-[55vh] overflow-auto pb-1">
                {hits.map((h, i) => (
                  <li key={h.alias} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link href={`/product/${h.alias}`} onClick={() => setOpen(false)} onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${i === active ? 'bg-soft' : ''}`}>
                      <img src={h.img} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-lg object-cover" loading="lazy" />
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate font-display text-[16px] text-ink">{h.title}</span>
                        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">{h.code}</span>
                      </span>
                      <span className="shrink-0 text-right text-[13px] leading-tight">
                        {h.inStock ? <span className="font-semibold text-ink">{rs(h.price)}</span> : <span className="text-muted">{t('Sold out')}</span>}
                        {h.inStock && h.was && <span className="block text-[11px] text-muted line-through">{rs(h.was)}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={all} onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 border-t border-line px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-dark hover:bg-soft">{t('See all results for')} “{term}” <ArrowRight className="h-3.5 w-3.5" /></Link>
            </>
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="font-display text-[18px] text-ink">{t('No pieces match')} “{term}”</p>
              <p className="mt-1 text-[13px] text-muted">{t('Try a colour, a fabric or a product code.')}</p>
              {quick.length > 0 && <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quick.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-2 hover:border-ink">{l.name}</Link>)}
              </div>}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
