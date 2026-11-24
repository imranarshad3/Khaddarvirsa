'use client';

export default function QuantitySelector({ value, onChange, max = 50 }: { value: number; onChange: (v: number) => void; max?: number }) {
  const btn = 'flex h-9 w-9 items-center justify-center rounded-full text-[18px] leading-none text-ink transition hover:bg-soft disabled:opacity-30';
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label="Quantity">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">−</button>
      <span className="min-w-[28px] text-center text-[15px] font-semibold text-ink" aria-live="polite">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
}
