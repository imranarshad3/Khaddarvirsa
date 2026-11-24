'use client';
export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-full border border-line bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-gold">Print invoice</button>;
}
