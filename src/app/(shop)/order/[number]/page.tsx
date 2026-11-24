import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { orderByNumber, PAYMENT_METHODS } from '@/lib/orders';
import { getSettings, whatsappLink } from '@/lib/settings';
import { rs } from '@/lib/pricing';
import PageBanner from '@/components/layout/PageBanner';
import { CheckIcon } from '@/components/icons';

export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const o = /^KK[0-9A-F]{10}$/.test(number) ? orderByNumber(number) : null;
  if (!o) notFound();
  const s = getSettings();
  return (
    <>
      <PageBanner title="Order Confirmation" crumbs={[{ name: 'Order' }]} />
      <div className="container-kk mt-8 max-w-[760px]">
        <div className="rounded border border-green-200 bg-green-50 p-5 text-center">
          <CheckIcon className="mx-auto h-10 w-10 text-green-700" />
          <h2 className="mt-2 text-[22px] text-green-800">Thank you, {o.name}! Your order has been placed.</h2>
          <p className="mt-1 text-[17px] text-ink-2">Order number: <strong>{o.number}</strong></p>
          <p className="text-[16px]">We will call you on your mobile number to confirm the order before dispatch.</p>
        </div>

        {o.payment_method === 'bank' && (
          <div className="mt-5 rounded bg-soft p-4 text-[16px] leading-6">
            <h3 className="mb-1 font-bold text-ink-2">Bank transfer details</h3>
            {s.bank_details.map((b) => <p key={b.account_number}>{b.bank} — {b.account_title}<br />Account: {b.account_number} · IBAN: {b.iban}</p>)}
            <p className="mt-2">Please use <strong>{o.number}</strong> as the payment reference. {s.bank_note}</p>
          </div>
        )}

        <table className="mt-6 w-full border border-[#ddd] text-[16px]">
          <tbody>
            {o.items.map((i) => (
              <tr key={i.id} className="border-b border-[#ddd]">
                <td className="p-2"><img src={i.img ?? '/brand/favicon.svg'} alt="" width={48} height={48} className="h-12 w-12 rounded object-cover" /></td>
                <td className="p-2 leading-tight"><span className="font-bold text-ink">{i.title}</span><br /><span className="text-muted">{i.code}</span></td>
                <td className="p-2 text-center">× {i.qty}</td>
                <td className="p-2 text-right">{rs(i.unit_price * i.qty)}</td>
              </tr>
            ))}
            <tr><td colSpan={3} className="p-2 text-right">Total Bill</td><td className="p-2 text-right">{rs(o.subtotal)}</td></tr>
            {o.discount > 0 && <tr><td colSpan={3} className="p-2 text-right">Discount ({o.discount_code})</td><td className="p-2 text-right">− {rs(o.discount)}</td></tr>}
            <tr><td colSpan={3} className="p-2 text-right">Shipping</td><td className="p-2 text-right">{o.shipping ? rs(o.shipping) : 'Free'}</td></tr>
            <tr className="bg-soft font-bold text-ink"><td colSpan={3} className="p-2 text-right">Final Bill</td><td className="p-2 text-right">{rs(o.total)}</td></tr>
          </tbody>
        </table>
        <p className="mt-4 text-[16px]">Payment method: <strong>{PAYMENT_METHODS[o.payment_method]}</strong> · Delivery city: <strong>{o.city}</strong></p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded bg-primary px-6 py-2.5 text-white">Continue shopping</Link>
          {s.whatsapp_number && <a href={whatsappLink(s.whatsapp_number)} target="_blank" rel="noopener" className="rounded border border-ink-2 px-6 py-2.5">Questions? WhatsApp us</a>}
        </div>
      </div>
    </>
  );
}
