'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import QuantitySelector from './QuantitySelector';
import type { Quote } from './useQuote';
import { rs } from '@/lib/pricing';
import { CloseIcon } from '@/components/icons';

export function CartTable({ quote, editable = true }: { quote: Quote | null; editable?: boolean }) {
  const { items, setQty, remove } = useCart();
  const unavailable = new Set(quote?.lines.filter((l) => !l.available).map((l) => l.id));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border border-[#ddd] text-[15px]">
        <thead className="bg-soft text-ink-2">
          <tr>{editable && <th className="p-2"><span className="sr-only">Remove</span></th>}<th className="p-2">Image</th><th className="p-2 text-left">Product Name</th><th className="p-2">Quantity</th><th className="p-2">Unit Price</th><th className="p-2">Total</th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-[#ddd] text-center">
              {editable && <td className="p-2"><button type="button" onClick={() => remove(i.id)} aria-label={`Remove ${i.title}`} className="text-sale"><CloseIcon /></button></td>}
              <td className="p-2"><img src={i.img} alt="" width={56} height={56} className="mx-auto h-14 w-14 rounded object-cover" /></td>
              <td className="p-2 text-left leading-tight">
                <Link href={`/product/${i.alias}`} className="font-bold text-ink hover:text-hover">{i.title}</Link>
                <div className="text-muted">{i.code}</div>
                {unavailable.has(i.id) && <div className="font-bold text-sale">Out of stock — please remove</div>}
              </td>
              <td className="p-2">{editable ? <QuantitySelector value={i.qty} onChange={(q) => setQty(i.id, q)} /> : i.qty}</td>
              <td className="p-2">{rs(i.price)}</td>
              <td className="p-2 font-bold text-ink">{rs(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TotalsTable({ quote }: { quote: Quote | null }) {
  if (!quote) return <p className="py-4 text-center">Calculating…</p>;
  const row = 'flex justify-between border-b border-[#ddd] px-3 py-2';
  return (
    <div className="border border-[#ddd] text-[16px]">
      <div className={row}><span>Total Bill</span><span>{rs(quote.subtotal)}</span></div>
      {quote.discount > 0 && <div className={`${row} text-green-700`}><span>Discount</span><span>− {rs(quote.discount)}</span></div>}
      <div className={row}>
        <span>Shipping Charges{quote.freeShippingOver > 0 && <small className="block text-[14px] text-sale">*Free Shipping on orders above {rs(quote.freeShippingOver)}!</small>}</span>
        <span>{quote.shipping ? rs(quote.shipping) : 'Free'}</span>
      </div>
      <div className="flex justify-between bg-soft px-3 py-2 font-bold text-ink"><span>Final Bill</span><span>{rs(quote.total)}</span></div>
    </div>
  );
}
