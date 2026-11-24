'use client';
import { useEffect, useState } from 'react';

export default function HeroSlider({ slides }: { slides: { img: string; link: string }[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative overflow-hidden bg-paper"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, n) => {
          const img = <img src={s.img} alt={`Slide ${n + 1}`} width={1920} height={650} loading={n === 0 ? 'eager' : 'lazy'} fetchPriority={n === 0 ? 'high' : 'auto'} className="aspect-[1920/650] w-full shrink-0 object-cover" />;
          return <div key={n} className="w-full shrink-0" aria-hidden={n !== i}>{s.link ? <a href={s.link} tabIndex={n === i ? 0 : -1}>{img}</a> : img}</div>;
        })}
      </div>
      {slides.length > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => setI((i - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 bg-paper/80 text-xl text-ink">‹</button>
          <button type="button" aria-label="Next slide" onClick={() => setI((i + 1) % slides.length)}
            className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 bg-paper/80 text-xl text-ink">›</button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, n) => (
              <button key={n} type="button" aria-label={`Go to slide ${n + 1}`} aria-current={n === i}
                onClick={() => setI(n)} className={`h-[3px] ${n === i ? 'w-8 bg-white' : 'w-4 bg-white/50'} transition-all`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
