import ConfirmButton from '../ConfirmButton';
import { db } from '@/lib/db';
import { rs } from '@/lib/pricing';
import { deleteDiscount, saveDiscount } from '../../actions';
import { Card, Check, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Discounts' };
type D = { id: number; code: string; type: 'percent' | 'fixed'; value: number; min_subtotal: number; active: number; expires_at: string | null; used_count: number };

function DiscountForm({ d }: { d?: D }) {
  const k = d?.id ?? 'new';
  return (
    <form action={saveDiscount} className="grid items-end gap-2 sm:grid-cols-[1fr_110px_90px_110px_150px_auto_auto]">
      {d && <input type="hidden" name="id" value={d.id} />}
      <div><label className="label" htmlFor={`c${k}`}>Code</label><input id={`c${k}`} name="code" required defaultValue={d?.code} className="field uppercase" /></div>
      <div><label className="label" htmlFor={`t${k}`}>Type</label>
        <select id={`t${k}`} name="type" defaultValue={d?.type ?? 'percent'} className="field"><option value="percent">% off</option><option value="fixed">Rs off</option></select></div>
      <div><label className="label" htmlFor={`v${k}`}>Value</label><input id={`v${k}`} name="value" type="number" min={1} required defaultValue={d?.value} className="field" /></div>
      <div><label className="label" htmlFor={`m${k}`}>Min. subtotal</label><input id={`m${k}`} name="min_subtotal" type="number" min={0} defaultValue={d?.min_subtotal ?? 0} className="field" /></div>
      <div><label className="label" htmlFor={`e${k}`}>Expires (end of day)</label><input id={`e${k}`} name="expires_at" type="date" defaultValue={d?.expires_at ?? ''} className="field" /></div>
      <Check label="Active" name="active" defaultChecked={d ? !!d.active : true} />
      <Save>{d ? 'Save' : 'Add'}</Save>
    </form>
  );
}

export default async function Discounts({ searchParams }: { searchParams: SP }) {
  const list = (await db().prepare('SELECT * FROM discounts ORDER BY id DESC').all()) as D[];
  return (
    <>
      <H1>Discount codes</H1>
      <Notice sp={await searchParams} />
      <Card title="New code"><DiscountForm /></Card>
      {list.map((d) => (
        <Card key={d.id}>
          <DiscountForm d={d} />
          <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
            <span>{d.type === 'percent' ? `${d.value}% off` : `${rs(d.value)} off`}{d.min_subtotal ? ` orders over ${rs(d.min_subtotal)}` : ''} · used {d.used_count}×</span>
            <form action={deleteDiscount}><input type="hidden" name="id" value={d.id} /><ConfirmButton message={`Delete code ${d.code}?`} className="text-sale hover:underline">Delete</ConfirmButton></form>
          </div>
        </Card>
      ))}
    </>
  );
}
