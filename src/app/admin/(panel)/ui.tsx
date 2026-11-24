import Link from 'next/link';
import { rs } from '@/lib/pricing';
import type { Order } from '@/lib/orders';
// Small shared pieces for admin pages.
export type SP = Promise<Record<string, string | undefined>>;

export function Notice({ sp }: { sp: Record<string, string | undefined> }) {
  if (sp.error) return <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sale">{sp.error}</p>;
  if (sp.saved) return <p role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800"><span aria-hidden>✓</span> Saved.</p>;
  return null;
}

export const Card = ({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={`mb-5 rounded-2xl border border-line/70 bg-white p-5 shadow-[0_1px_2px_rgba(53,34,24,.04),0_12px_32px_-18px_rgba(53,34,24,.18)] md:p-6 ${className}`}>
    {title && <h2 className="mb-4 flex items-center gap-2.5 font-display text-[19px] text-ink"><span aria-hidden className="h-4 w-[3px] rounded bg-gold" />{title}</h2>}
    {children}
  </section>
);

export function Field({ label, name, hint, ...rest }: { label: string; name: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className="field" {...rest} />
      {hint && <p className="mt-0.5 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export function Area({ label, name, hint, ...rest }: { label: string; name: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <textarea id={name} name={name} rows={4} className="field" {...rest} />
      {hint && <p className="mt-0.5 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export const Check = ({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) => (
  <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#795536]" /> {label}</label>
);

export const Save = ({ children = 'Save' }: { children?: React.ReactNode }) => (
  <button className="h-11 rounded-full bg-ink px-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_-12px_rgba(53,34,24,.7)] transition hover:bg-gold-dark">{children}</button>
);

export const H1 = ({ children }: { children: React.ReactNode }) => <h1 className="mb-6 flex flex-wrap items-center gap-3 font-display text-[30px] leading-tight text-ink md:text-[34px]">{children}</h1>;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-900', confirmed: 'bg-blue-100 text-blue-900', shipped: 'bg-purple-100 text-purple-900',
  delivered: 'bg-green-100 text-green-900', cancelled: 'bg-gray-200 text-gray-700',
};
export const StatusPill = ({ s }: { s: string }) => <span className={`inline-flex rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium capitalize ${STATUS_COLORS[s] ?? ''}`}>{s}</span>;

export function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
          <tr><th className="py-2">Order</th><th className="pr-3">Status</th><th>Date</th><th>Customer</th><th>City</th><th>Payment</th><th className="text-right">Total</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-line/70 transition-colors last:border-0 hover:bg-soft/60">
              <td className="py-2"><Link href={`/admin/orders/${o.id}`} className="font-bold text-primary hover:underline">{o.number}</Link></td>
              <td className="pr-3"><StatusPill s={o.status} /></td>
              <td>{o.created_at.slice(0, 16)}</td><td>{o.name}<div className="text-[12px] text-muted">{o.phone}</div></td>
              <td>{o.city}</td><td className="uppercase">{o.payment_method}</td><td className="text-right">{rs(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
