import { imageUrl, type Category, type SubCategory } from '@/lib/catalog';
import { saveSubCategory } from '../../actions';
import { Area, Check, Field, Save } from '../ui';

export default function SubForm({ s, cats }: { s?: SubCategory; cats: Category[] }) {
  return (
    <form action={saveSubCategory} className="grid gap-3">
      {s && <input type="hidden" name="id" value={s.id} />}
      <input type="hidden" name="img" value={s?.img ?? ''} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={s?.name} />
        <Field label="URL alias" name="alias" defaultValue={s?.alias} hint="Empty = built from the name." />
        <div>
          <label htmlFor="category_id" className="label">Main category</label>
          <select id="category_id" name="category_id" required defaultValue={s?.category_id} className="field">
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Menu order" name="order_no" type="number" defaultValue={s?.order_no ?? 0} />
          <Field label="Homepage order" name="home_order_no" type="number" defaultValue={s?.home_order_no ?? 0} />
        </div>
      </div>
      <div className="flex flex-wrap gap-5">
        <Check label="Show in menu" name="status" defaultChecked={s ? !!s.status : true} />
        <Check label="Feature on homepage" name="featured" defaultChecked={!!s?.featured} />
      </div>
      <Area label="Description" name="description" rows={2} defaultValue={s?.description ?? ''} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Meta title" name="meta_title" defaultValue={s?.meta_title ?? ''} maxLength={70} />
        <Field label="Meta description" name="meta_description" defaultValue={s?.meta_description ?? ''} maxLength={170} />
      </div>
      <div className="flex items-center gap-3">
        {s?.img && <img src={imageUrl(s.img, 'sub_cat', '100x100_cover')} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />}
        <div><label className="label" htmlFor="image">Circle image</label>
          <input id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" /></div>
      </div>
      <div><Save>{s ? 'Save collection' : 'Add collection'}</Save></div>
    </form>
  );
}
