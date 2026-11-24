'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '80px 16px' }}>
        <h1>Something went wrong</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset} style={{ marginTop: 16, padding: '10px 24px' }}>Try again</button>
      </body>
    </html>
  );
}
