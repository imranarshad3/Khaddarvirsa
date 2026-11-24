'use client';
import { useEffect, useState } from 'react';

/** Live days/hours/minutes/seconds until `to` (ISO). Renders nothing before mount or once the time has passed. */
export default function Countdown({ to, className = '' }: { to: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = now === null ? 0 : Math.max(0, new Date(to).getTime() - now);
  if (!left) return null;
  const s = Math.floor(left / 1000);
  const parts: [number, string][] = [[Math.floor(s / 86400), 'Days'], [Math.floor(s / 3600) % 24, 'Hrs'], [Math.floor(s / 60) % 60, 'Min'], [s % 60, 'Sec']];
  return (
    <div className={`flex gap-2 ${className}`} role="timer" aria-label="Time left in the sale">
      {parts.map(([v, l]) => (
        <span key={l} className="flex min-w-[54px] flex-col items-center rounded-xl border border-white/25 bg-white/10 px-2 py-1.5 backdrop-blur-sm">
          <span className="font-display text-[24px] leading-none tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] opacity-80">{l}</span>
        </span>
      ))}
    </div>
  );
}
