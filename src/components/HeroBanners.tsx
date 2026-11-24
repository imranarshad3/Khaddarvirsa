'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export type Banner = { eyebrow: string; title: string; text: string; href: string; cta: string; images: string[]; /** Horizontal position (0-100%) of the person in the photo, kept in view on phones. */ focus?: number };

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
              {/* Phones: photo on top, cropped around the person, text below on dark. Desktop: full-bleed photo behind the text. */}
              <div className="relative aspect-[4/5] overflow-hidden md:absolute md:inset-0 md:aspect-auto">
                <img src={b.images[0]} alt="" width={1600} height={900} loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'}
                  style={{ '--fx': `${b.focus ?? 50}%` } as React.CSSProperties}
                  className={`absolute inset-0 h-full w-full object-cover object-[var(--fx)_center] md:object-center transition-transform ease-out ${on ? 'scale-105 duration-[7000ms] md:scale-110' : 'scale-100 duration-0'}`} />
                <span aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-ink/95 via-ink/70 to-ink/20 md:block" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent md:h-40 md:from-ink/80 md:via-transparent" />
              </div>
              <div className="container-kk relative -mt-24 flex items-center pb-24 md:mt-0 md:min-h-[560px] md:py-20 lg:min-h-[640px]">
                <div className={`max-w-[620px] transition-all delay-200 duration-1000 ${on ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                  <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand md:text-[13px]"><span aria-hidden className="h-px w-8 md:w-10 bg-sand" />{b.eyebrow}</p>
                  <p className="font-display mt-3 text-[34px] leading-[1.06] md:mt-5 md:text-[44px] md:leading-[1.04] drop-shadow-[0_2px_12px_rgba(0,0,0,.35)] sm:text-[60px] lg:text-[76px]">{b.title}</p>
                  <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed md:mt-6 md:text-[17px] text-white/85">{b.text}</p>
                  <Link href={b.href} tabIndex={on ? 0 : -1}
                    className="mt-6 inline-flex items-center gap-3 rounded-full bg-sand px-7 py-3.5 md:mt-9 md:px-8 md:py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-white">
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
