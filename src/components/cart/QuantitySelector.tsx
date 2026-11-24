'use client';

/** Red − / gold number / green + (as on the reference cart). */
export default function QuantitySelector({ value, onChange, max = 50 }: { value: number; onChange: (v: number) => void; max?: number }) {
  const btn = 'flex h-7 w-7 items-center justify-center rounded text-white text-[18px] leading-none disabled:opacity-40';
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Quantity">
      <button type="button" className={`${btn} bg-[#d9534f]`} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">−</button>
      <span className="min-w-[28px] text-center text-[16px] font-bold text-gold" aria-live="polite">{value}</span>
      <button type="button" className={`${btn} bg-[#5cb85c]`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
}
