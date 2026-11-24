import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { rs } from '@/lib/pricing';
import { imageUrl } from '@/lib/catalog';
import { ORDER_STATUSES, PAYMENT_METHODS, type Order, type OrderItem } from '@/lib/orders';
import { updateOrder } from '../../../actions';
import { getSettings, whatsappLink } from '@/lib/settings';
import PrintButton from './PrintButton';
import { Area, Card, H1, Notice, Save, StatusPill, type SP } from '../../ui';

export const metadata = { title: 'Order' };

export default async function OrderDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const id = Number((await params).id);
  const o = (await db().prepare('SELECT * FROM orders WHERE id = ?').get(id)) as (Order & { updated_at: string }) | undefined;
  if (!o) notFound();
  const items = (await db().prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)) as OrderItem[];
  return (
    <>
      <Link href="/admin/orders" className="text-primary print:hidden">← Orders</Link>
      <p className="hidden font-display text-[22px] print:block">{(await getSettings()).store_name}</p>
      <H1>Order {o.number} <StatusPill s={o.status} />
        <span className="ml-auto flex flex-wrap gap-2 font-sans print:hidden">
          <a href={`${whatsappLink(o.phone)}?text=${encodeURIComponent(`Assalam o Alaikum ${o.name}, about your order ${o.number} (${rs(o.total)}):`)}`} target="_blank" rel="noopener"
            className="rounded-full bg-[#1f9d55] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#178246]">WhatsApp customer</a>
          <PrintButton />
        </span></H1>
      <div className="print:hidden"><Notice sp={await searchParams} /></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px] print:block">
        <div>
          <Card title="Items">
            <table className="w-full text-left">
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b">
                    <td className="py-2 pr-2"><img src={imageUrl(it.img, 'product', '100x100_cover')} alt="" width={48} height={48} className="h-12 w-12 object-cover" /></td>
                    <td>{it.title}{it.code && <div className="text-[12px] text-muted">Code: {it.code}</div>}</td>
                    <td className="text-right">{rs(it.unit_price)} × {it.qty}</td>
                    <td className="text-right">{rs(it.unit_price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="ml-auto mt-3 grid max-w-[280px] grid-cols-2 gap-1 text-right">
              <dt>Subtotal</dt><dd>{rs(o.subtotal)}</dd>
              {o.discount > 0 && <><dt>Discount {o.discount_code && `(${o.discount_code})`}</dt><dd>−{rs(o.discount)}</dd></>}
              <dt>Shipping</dt><dd>{o.shipping ? rs(o.shipping) : 'Free'}</dd>
              <dt className="font-bold">Total</dt><dd className="font-bold">{rs(o.total)}</dd>
            </dl>
          </Card>
          <Card title="Customer">
            <dl className="grid grid-cols-[110px_1fr] gap-1">
              <dt className="text-muted">Name</dt><dd>{o.name}</dd>
              <dt className="text-muted">Phone</dt><dd><a href={`tel:${o.phone}`} className="text-primary">{o.phone}</a></dd>
              <dt className="text-muted">Email</dt><dd>{o.email || '—'}</dd>
              <dt className="text-muted">City</dt><dd>{o.city}</dd>
              <dt className="text-muted">Address</dt><dd className="whitespace-pre-line">{o.address}</dd>
              <dt className="text-muted">Remarks</dt><dd className="whitespace-pre-line">{o.remarks || '—'}</dd>
              <dt className="text-muted">Payment</dt><dd>{PAYMENT_METHODS[o.payment_method] ?? o.payment_method}</dd>
              <dt className="text-muted">Placed</dt><dd>{o.created_at} UTC</dd>
            </dl>
          </Card>
        </div>
        <Card title="Update" className="print:hidden">
          <form action={updateOrder} className="grid gap-3">
            <input type="hidden" name="id" value={o.id} />
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={o.status} className="field capitalize">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="mt-0.5 text-[12px] text-muted">Cancelling returns tracked stock to the products.</p>
            </div>
            <Area label="Internal note (not shown to the customer)" name="admin_note" defaultValue={o.admin_note ?? ''} />
            <div><Save /></div>
            <p className="text-[12px] text-muted">Last updated {o.updated_at} UTC</p>
          </form>
        </Card>
      </div>
    </>
  );
}
