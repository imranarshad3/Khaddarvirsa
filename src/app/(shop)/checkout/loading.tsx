export default function Loading() {
  return (
    <div className="container-kk mt-8 grid gap-6 lg:grid-cols-[1fr_420px] lg:gap-10" aria-busy="true" aria-label="Loading checkout">
      <div className="space-y-6">{[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl border border-line bg-white/60" />)}</div>
      <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-paper" />
    </div>
  );
}
