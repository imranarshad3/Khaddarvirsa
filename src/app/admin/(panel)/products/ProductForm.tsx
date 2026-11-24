import ConfirmButton from '../ConfirmButton';
import { db } from '@/lib/db';
import { imageUrl, type Product } from '@/lib/catalog';
import { deleteProduct, saveProduct } from '../../actions';
import { Area, Card, Check, Field, Save } from '../ui';
import AiAssistant from './AiAssistant';

export default async function ProductForm({ p }: { p?: Product }) {
  const subs = (await db().prepare(`SELECT s.id, s.name, c.name cat FROM sub_categories s JOIN categories c ON c.id = s.category_id ORDER BY c.order_no, s.order_no, s.name`)
    .all()) as { id: number; name: string; cat: string }[];
  return (
    <>
      <form action={saveProduct} className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="img" value={p?.img ?? ''} />
        <div>
          <Card title="Product">
            <div className="grid gap-3">
              <Field label="Title" name="title" required defaultValue={p?.title} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Article code" name="code" defaultValue={p?.code ?? ''} />
                <Field label="URL alias" name="alias" defaultValue={p?.alias} hint="Leave empty to build it from the title and code." />
              </div>
              <div>
                <label htmlFor="sub_category_id" className="label">Collection</label>
                <select id="sub_category_id" name="sub_category_id" required defaultValue={p?.sub_category_id} className="field">
                  <option value="">Choose…</option>
                  {subs.map((s) => <option key={s.id} value={s.id}>{s.cat} › {s.name}</option>)}
                </select>
              </div>
              <Area label="Description" name="description" rows={8} defaultValue={p?.description}
                hint="One feature per line. Lines like “Fabric: Khaddar” show as details on the product page." />
              <Field label="YouTube link" name="youtube_link" type="url" defaultValue={p?.youtube_link ?? ''} />
            </div>
          </Card>
          <AiAssistant enabled={Boolean(process.env.GROQ_API_KEY)} />
          <Card title="Search engines">
            <div className="grid gap-3">
              <Field label="Meta title" name="meta_title" defaultValue={p?.meta_title ?? ''} maxLength={70} />
              <Area label="Meta description" name="meta_description" rows={2} defaultValue={p?.meta_description ?? ''} maxLength={170} />
            </div>
          </Card>
        </div>
        <div>
          <Card title="Price & stock">
            <div className="grid gap-3">
              <Field label="Price (Rs)" name="price" type="number" min={1} required defaultValue={p?.price} />
              <Field label="Sale price (Rs)" name="sale_price" type="number" min={1} defaultValue={p?.sale_price ?? ''} hint="Empty = no discount." />
              <Field label="Stock quantity" name="stock" type="number" min={0} defaultValue={p?.stock ?? ''}
                hint="Empty = not tracked. When tracked, orders reduce it and 0 marks the product out of stock." />
              <Check label="In stock" name="in_stock" defaultChecked={p ? !!p.in_stock : true} />
              <Check label={`Show in “Today's sale”`} name="on_sale" defaultChecked={!!p?.on_sale} />
              <Check label="Hidden from the shop" name="hidden" defaultChecked={!!p?.hidden} />
            </div>
          </Card>
          <Card title="Image">
            {p?.img && <img src={imageUrl(p.img, 'product', '300x300_cover')} alt="" width={300} height={300} className="mb-2 aspect-square w-full object-cover" />}
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" aria-label="Upload image" />
            <p className="mt-1 text-[12px] text-muted">JPG, PNG, WebP or GIF, up to 4 MB. Uploading replaces the current image.</p>
          </Card>
          <Save>{p ? 'Save product' : 'Create product'}</Save>
        </div>
      </form>
      {p && (
        <form action={deleteProduct} className="mt-6 border-t pt-4">
          <input type="hidden" name="id" value={p.id} />
          <p className="mb-2 text-[13px] text-muted">Deleting removes the product from the shop. Past orders keep their copy of the title and price. To pause it instead, tick “Hidden”.</p>
          <ConfirmButton message={`Delete "${p.title}" permanently? This cannot be undone.`} className="rounded-full border border-sale px-5 py-2 text-sale hover:bg-red-50">Delete product</ConfirmButton>
        </form>
      )}
    </>
  );
}
