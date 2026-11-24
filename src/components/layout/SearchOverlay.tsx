'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchSuggest } from '@/app/actions';
import { SearchIcon } from '@/components/icons';

type Hit = { alias: string; title: string; code: string | null; img: string };

/** Search box with a live dropdown of matching products (like the reference). Enter opens the full results page. */
export default function SearchOverlay({ dark = false }: { dark?: boolean }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState('');
  const router = useRouter();
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); setDone(''); return; }
    let live = true;
    const t = setTimeout(() => searchSuggest(q).then((h) => { if (live) { setHits(h); setDone(q); } }), 200);
    return () => { live = false; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <form ref={box} role="search" className="relative"
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) { setOpen(false); router.push(`/search?q=${encodeURIComponent(q.trim())}`); } }}>
      <label htmlFor={dark ? 'search-m' : 'search-d'} className="sr-only">Search products</label>
      <input id={dark ? 'search-m' : 'search-d'} type="search" value={q} placeholder="Search khaddar…" autoComplete="off"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        className="w-full rounded-full border border-line bg-white/70 py-2.5 pl-11 pr-4 text-[15px] text-ink-2 outline-none transition placeholder:text-muted focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10 [&::-webkit-search-cancel-button]:hidden" />
      <button type="submit" aria-label="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"><SearchIcon className="h-[18px] w-[18px]" /></button>
      {open && done && done === q && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-paper sm:min-w-[340px] shadow-[0_24px_50px_-20px_rgba(53,34,24,.35)]" style={{ animation: 'kk-fade .15s' }}>
          {hits.length ? (
            <>
              <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Products</p>
              <ul className="max-h-[55vh] overflow-auto pb-1">
                {hits.map((h) => (
                  <li key={h.alias}>
                    <Link href={`/product/${h.alias}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-soft">
                      <img src={h.img} alt="" width={48} height={48} className="h-12 w-12 object-cover" loading="lazy" />
                      <span className="leading-tight"><span className="block font-display text-[16px] text-ink">{h.title}</span><span className="text-[12px] uppercase tracking-[0.12em] text-muted">{h.code}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={() => setOpen(false)}
                className="block border-t border-line px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-dark hover:bg-soft">View all results for “{q.trim()}” →</Link>
            </>
          ) : <p className="px-4 py-5 text-center text-[15px]">No products match “{q.trim()}”.</p>}
        </div>
      )}
    </form>
  );
}
