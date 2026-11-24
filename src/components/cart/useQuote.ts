'use client';
import { useEffect, useState } from 'react';
import { quoteCart } from '@/app/actions';
import { useCart } from './CartProvider';

export type Quote = Awaited<ReturnType<typeof quoteCart>>;

/** Server-priced totals for the current cart (prices, stock and discount are re-checked on the server). */
export function useQuote(code?: string) {
  const { items, ready, add } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const key = JSON.stringify(items.map((i) => [i.id, i.qty])) + '|' + (code ?? '');

  useEffect(() => {
    if (!ready) return;
    let live = true;
    quoteCart(items.map((i) => ({ id: i.id, qty: i.qty })), code).then((q) => {
      if (!live) return;
      setQuote(q);
      // Refresh stored prices if the shop changed them since the item was added.
      for (const l of q.lines) {
        const it = items.find((i) => i.id === l.id);
        if (it && l.available && l.price !== it.price) add({ ...it, price: l.price }, 0);
      }
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return quote;
}
