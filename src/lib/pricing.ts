// Pure pricing rules shared by the cart (client) and order placement (server).

export type Discount = { code: string; type: 'percent' | 'fixed'; value: number; min_subtotal: number };

export function unitPrice(p: { price: number; sale_price: number | null }) {
  return p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
}

export function discountPercent(p: { price: number; sale_price: number | null }) {
  return p.sale_price && p.sale_price < p.price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
}

export function totals(subtotal: number, shipping: { charges: number; freeOver: number }, discount?: Discount | null) {
  let off = 0;
  if (discount && subtotal >= discount.min_subtotal)
    off = discount.type === 'percent' ? Math.round((subtotal * Math.min(discount.value, 100)) / 100) : Math.min(discount.value, subtotal);
  const ship = subtotal === 0 || subtotal >= shipping.freeOver ? 0 : shipping.charges;
  return { subtotal, discount: off, shipping: ship, total: subtotal - off + ship };
}

export const rs = (n: number) => 'Rs. ' + n.toLocaleString('en-PK');
