'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { useQuote } from '@/components/cart/useQuote';
import { CartTable, TotalsTable } from '@/components/cart/CartTable';
import { submitOrder } from '@/app/actions';
import type { Settings } from '@/lib/settings';

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="mb-5 rounded border border-[#ddd]">
    <legend className="ml-3 px-2 text-[17px] font-bold text-ink-2">{title}</legend>
    <div className="space-y-3 p-4 pt-1">{children}</div>
  </fieldset>
);

export default function CheckoutForm({ bank, bankNote }: { bank: Settings['bank_details']; bankNote: string }) {
  const { items, ready, clear } = useCart();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | undefined>();
  const [payment, setPayment] = useState('cod');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const quote = useQuote(appliedCode);
  const blocked = !quote || quote.lines.some((l) => !l.available);

  if (ready && items.length === 0)
    return <div className="py-10 text-center"><p className="mb-4">Your cart is empty.</p><Link href="/" className="rounded bg-primary px-6 py-2.5 text-white">Continue shopping</Link></div>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    const f = new FormData(e.currentTarget);
    const res = await submitOrder({
      name: String(f.get('name')), phone: String(f.get('phone')), email: String(f.get('email') || ''),
      city: String(f.get('city')), address: String(f.get('address')), remarks: String(f.get('remarks') || ''),
      payment_method: payment, discount_code: appliedCode, items: items.map((i) => ({ id: i.id, qty: i.qty })),
    }).catch(() => ({ ok: false as const, error: 'Network error. Please check your connection and try again.' }));
    if (res.ok) {
      clear();
      router.push(`/order/${res.number}`);
    } else {
      setError(res.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div>
        <Panel title="Your Personal Details">
          <div><label className="label" htmlFor="name">Your Name *</label><input id="name" name="name" required maxLength={100} autoComplete="name" className="field" /></div>
          <div><label className="label" htmlFor="email">E-Mail (optional)</label><input id="email" name="email" type="email" maxLength={150} autoComplete="email" className="field" /></div>
          <div>
            <label className="label" htmlFor="phone">Mobile *</label>
            <input id="phone" name="phone" type="tel" required inputMode="tel" placeholder="03XXXXXXXXX" autoComplete="tel" className="field" />
          </div>
        </Panel>
        <Panel title="Your Address">
          <div><label className="label" htmlFor="city">City *</label><input id="city" name="city" required maxLength={80} autoComplete="address-level2" className="field" /></div>
          <div><label className="label" htmlFor="address">Address *</label><textarea id="address" name="address" required minLength={5} maxLength={500} rows={3} autoComplete="street-address" className="field" /></div>
        </Panel>
        <Panel title="Payment Method">
          <label className="flex items-center gap-2 text-[16px] text-ink-2"><input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} className="accent-gold" /> Cash on Delivery</label>
          {bank.length > 0 && (
            <label className="flex items-center gap-2 text-[16px] text-ink-2"><input type="radio" name="payment" value="bank" checked={payment === 'bank'} onChange={() => setPayment('bank')} className="accent-gold" /> Direct Bank Transfer</label>
          )}
          {payment === 'bank' && (
            <div className="rounded bg-soft p-3 text-[15px] leading-6">
              {bank.map((b) => (
                <p key={b.account_number}><strong>{b.bank}</strong><br />Title: {b.account_title}<br />Account: {b.account_number}<br />IBAN: {b.iban}</p>
              ))}
              {bankNote && <p className="mt-2 text-sale">{bankNote}</p>}
            </div>
          )}
        </Panel>
      </div>

      <div>
        <CartTable quote={quote} />
        <div className="mt-4 flex gap-2">
          <label htmlFor="code" className="sr-only">Discount code</label>
          <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" className="field" />
          <button type="button" onClick={() => setAppliedCode(code.trim() || undefined)} className="rounded border border-ink-2 px-4 text-[15px]">Apply</button>
        </div>
        {quote?.discountValid === false && <p className="mt-1 text-[15px] text-sale">That discount code is not valid for this order.</p>}
        {quote?.discountValid && quote.discount === 0 && <p className="mt-1 text-[15px] text-sale">This code needs a higher order total.</p>}
        <div className="mt-4"><TotalsTable quote={quote} /></div>
        <div className="mt-4">
          <label className="label" htmlFor="remarks">Remarks (optional)</label>
          <textarea id="remarks" name="remarks" rows={3} maxLength={1000} className="field" />
        </div>
        {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-[16px] text-sale">{error}</p>}
        <button type="submit" disabled={pending || blocked || quote?.discountValid === false}
          className="mt-4 h-11 w-full rounded-md bg-primary text-[17px] text-white disabled:opacity-60">
          {pending ? 'Placing order…' : 'Confirm Order'}
        </button>
      </div>
    </form>
  );
}
