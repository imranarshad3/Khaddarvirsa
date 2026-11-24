'use client';
import Link from 'next/link';

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-kk py-20 text-center">
      <h1 className="text-[28px]">Something went wrong</h1>
      <p className="mt-2">This page could not load just now. Please try again, or order on WhatsApp.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded bg-primary px-6 py-2.5 text-white">Try again</button>
        <Link href="/" className="rounded border border-line px-6 py-2.5">Back to home</Link>
      </div>
    </div>
  );
}
