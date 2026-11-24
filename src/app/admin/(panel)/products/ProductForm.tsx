import ConfirmButton from '../ConfirmButton';
import { db } from '@/lib/db';
import { imageUrl, type Product } from '@/lib/catalog';
import { deleteProduct, saveProduct } from '../../actions';
import { Area, Card, Check, Field, More, Save } from '../ui';
import AiAssistant from './AiAssistant';
import ImagePicker from '../ImagePicker';

export default async function ProductForm({ p }: { p?: Product }) {
  const subs = (await db().prepare(`SELECT s.id, s.name, c.name cat FROM sub_categories s JOIN categories c ON c.id = s.category_id ORDER BY c.order_no, s.order_no, s.name`)
    .all()) as { id: number; name: string; cat: string }[];
  return (
    <div className="pb-20">
      <form action={saveProduct} className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="img" value={p?.img ?? ''} />
        <div className="min-w-0">
          <Card title="Basic details">
            <div className="grid gap-4">
              <Field label="Product name" name="title" required defaultValue={p?.title} placeholder="e.g. Khaddi Live Winter – Coco Brown" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sub_category_id" className="label">Collection</label>
                  <select id="sub_category_id" name="sub_category_id" required defaultValue={p?.sub_category_id ?? ''} className="field">
                    <option value="">Choose…</option>
                    {subs.map((s) => <option key={s.id} value={s.id}>{s.cat} › {s.name}</option>)}
                  </select>
                </div>
                <Field label="Article code" name="code" defaultValue={p?.code ?? ''} placeholder="e.g. KL-333" />
              </div>
              <Area label="Description" name="description" rows={7} defaultValue={p?.description}
                hint="One point per line. Lines like “Fabric: Khaddar” show as a details table on the product page." />
            </div>
          </Card>
          <AiAssistant enabled={Boolean(process.env.GROQ_API_KEY)} />
          <More title="More options (web address, video, Google)">
            <Field label="Web address (URL alias)" name="alias" defaultValue={p?.alias} hint="Leave empty and it is made from the name and code." />
            <Field label="YouTube video link" name="youtube_link" type="url" defaultValue={p?.youtube_link ?? ''} />
            <Field label="Google title" name="meta_title" defaultValue={p?.meta_title ?? ''} maxLength={70} hint="Up to 70 characters. Empty = product name." />
            <Area label="Google description" name="meta_description" rows={2} defaultValue={p?.meta_description ?? ''} maxLength={170} />
          </More>
        </div>
        <div className="min-w-0">
          <Card title="Photo"><ImagePicker current={p?.img ? imageUrl(p.img, 'product', '600x600_cover') : null} label="Main photo" /></Card>
          <Card title="Price">
            <div className="grid gap-4">
              <Field label="Price (Rs)" name="price" type="number" min={1} required inputMode="numeric" defaultValue={p?.price} />
              <Field label="Sale price (Rs)" name="sale_price" type="number" min={1} inputMode="numeric" defaultValue={p?.sale_price ?? ''} hint="Leave empty if there is no discount." />
            </div>
          </Card>
          <Card title="Stock & visibility">
            <Field label="Quantity in stock" name="stock" type="number" min={0} inputMode="numeric" defaultValue={p?.stock ?? ''}
              hint="Optional. If filled, each order reduces it; at 0 the product shows out of stock." />
            <div className="mt-4 grid gap-1 border-t border-line/70 pt-3">
              <Check label="Available to buy" name="in_stock" defaultChecked={p ? !!p.in_stock : true} />
              <Check label="Premium – show first" name="premium" hint="Top of its category and in homepage Best sellers." defaultChecked={!!p?.premium} />
              <Field label="Premium position" name="premium_position" type="number" min={1} inputMode="numeric" defaultValue={p?.premium || ''}
                hint="1 shows first, 2 second… Empty = 1." />
              <Check label="Show on Sale page" name="on_sale" defaultChecked={!!p?.on_sale} />
              <Check label="Hide from shop" name="hidden" hint="Stays saved but customers can't see it." defaultChecked={!!p?.hidden} />
            </div>
          </Card>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-[#f7f2ea]/90 px-4 py-3 backdrop-blur print:hidden md:left-[256px] md:px-8">
          <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-3">
            <span className="mr-auto hidden text-[13px] text-muted sm:block">{p ? 'Changes go live as soon as you save.' : 'The product goes live when you create it, unless hidden.'}</span>
            <Save>{p ? 'Save changes' : 'Create product'}</Save>
          </div>
        </div>
      </form>
      {p && (
        <form action={deleteProduct} className="mt-2 rounded-2xl border border-red-200/70 bg-red-50/40 p-5">
          <input type="hidden" name="id" value={p.id} />
          <p className="mb-3 text-[13px] text-muted">Deleting removes the product from the shop for good. Past orders keep their copy. To pause it instead, turn on “Hide from shop”.</p>
          <ConfirmButton message={`Delete "${p.title}" permanently? This cannot be undone.`} className="rounded-full border border-sale px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-sale hover:bg-red-50">Delete product</ConfirmButton>
        </form>
      )}
    </div>
  );
}
