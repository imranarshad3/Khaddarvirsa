'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-8">
      <h1 className="text-[22px]">Something went wrong</h1>
      <p className="mt-2 text-muted">The action did not finish. Nothing was saved unless you see it in the list.{error.digest ? ` (ref ${error.digest})` : ''}</p>
      <button onClick={reset} className="mt-4 rounded bg-primary px-5 py-2 text-white">Try again</button>
    </div>
  );
}
