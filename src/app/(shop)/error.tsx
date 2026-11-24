'use client';
import Link from 'next/link';

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-kk py-16 text-center md:py-24">
      <h1 className="font-display text-[28px] text-ink md:text-[36px]">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-muted">This page could not load just now. Please try again, or order on WhatsApp.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-ink px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-sand transition hover:bg-ink-2">Try again</button>
        <Link href="/" className="rounded-full border border-line px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-ink">Back to home</Link>
      </div>
    </div>
  );
}
