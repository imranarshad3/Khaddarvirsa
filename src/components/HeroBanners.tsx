'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export type Banner = { eyebrow: string; title: string; text: string; href: string; cta: string; images: string[] };

/** Full-width hero: crossfading banners that change every few seconds, with a slow zoom on the photos. */
export default function HeroBanners({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;
  useEffect(() => {
    if (n < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), 6000);
    return () => clearTimeout(t);
  }, [i, n, paused]);
  if (!n) return null;

  return (
    <section aria-roledescription="carousel" aria-label="Featured collections" className="relative overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {banners.map((b, k) => {
          const on = k === i;
          return (
            <div key={k} aria-hidden={!on} aria-roledescription="slide" aria-label={`${k + 1} of ${n}`}
              className={`relative overflow-hidden transition-opacity duration-1000 ${on ? 'z-[1] opacity-100' : 'pointer-events-none opacity-0'}`}>
              <img src={b.images[0]} alt="" width={1600} height={900} loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'}
                className={`absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center transition-transform ease-out ${on ? 'scale-110 duration-[7000ms]' : 'scale-100 duration-0'}`} />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/20" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="container-kk relative flex min-h-[560px] items-center py-20 lg:min-h-[640px]">
                <div className={`max-w-[620px] transition-all delay-200 duration-1000 ${on ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.28em] text-sand"><span aria-hidden className="h-px w-10 bg-sand" />{b.eyebrow}</p>
                  <p className="font-display mt-5 text-[44px] leading-[1.04] drop-shadow-[0_2px_12px_rgba(0,0,0,.35)] sm:text-[60px] lg:text-[76px]">{b.title}</p>
                  <p className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-white/85">{b.text}</p>
                  <Link href={b.href} tabIndex={on ? 0 : -1}
                    className="mt-9 inline-flex items-center gap-3 rounded-full bg-sand px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-white">
                    {b.cta} <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="container-kk absolute inset-x-0 bottom-6 z-[2] flex items-center gap-5">
          <span className="font-display text-[18px] text-sand">{String(i + 1).padStart(2, '0')}</span>
          <div className="flex flex-1 gap-2 md:max-w-[320px]">
            {banners.map((b, k) => (
              <button key={k} type="button" aria-label={`Show banner ${k + 1}: ${b.eyebrow}`} aria-current={k === i} onClick={() => setI(k)}
                className="relative h-[2px] flex-1 overflow-hidden bg-white/20">
                <span className={`absolute inset-y-0 left-0 bg-sand ${k < i ? 'w-full' : k === i ? (paused ? 'w-full' : 'w-full animate-[kk-progress_6s_linear]') : 'w-0'}`} key={k === i ? `${i}-on` : k} />
              </button>
            ))}
          </div>
          <span className="font-display text-[18px] text-white/40">{String(n).padStart(2, '0')}</span>
          <div className="ml-auto flex gap-2">
            <button type="button" aria-label="Previous banner" onClick={() => setI((i - 1 + n) % n)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[18px] transition-colors hover:bg-white hover:text-ink">←</button>
            <button type="button" aria-label="Next banner" onClick={() => setI((i + 1) % n)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-[18px] transition-colors hover:bg-white hover:text-ink">→</button>
          </div>
        </div>
      )}
    </section>
  );
}
