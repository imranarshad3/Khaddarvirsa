import { imageUrl, type Category, type SubCategory } from '@/lib/catalog';
import { saveSubCategory } from '../../actions';
import { Area, Card, Check, Field, More, Save } from '../ui';
import ImagePicker from '../ImagePicker';

export default function SubForm({ s, cats }: { s?: SubCategory; cats: Category[] }) {
  return (
    <form action={saveSubCategory} className="grid gap-5 lg:grid-cols-[300px_1fr]">
      {s && <input type="hidden" name="id" value={s.id} />}
      <input type="hidden" name="img" value={s?.img ?? ''} />
      <Card title="Picture">
        <ImagePicker round current={s?.img ? imageUrl(s.img, 'sub_cat', '300x300_cover') : null} label="Shown in the circle on the homepage" />
      </Card>
      <div className="min-w-0">
        <Card title="Details">
          <div className="grid gap-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <Field label="Collection name" name="name" required defaultValue={s?.name} placeholder="e.g. Winter Collection 3000" />
              <div>
                <label htmlFor="category_id" className="label">Main category</label>
                <select id="category_id" name="category_id" required defaultValue={s?.category_id} className="field">
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <Area label="Short description" name="description" rows={2} defaultValue={s?.description ?? ''} hint="Optional. Shown at the top of the collection page." />
            <div className="grid gap-1 border-t border-line/70 pt-3 sm:grid-cols-2 sm:gap-x-8">
              <Check label="Show in menu" name="status" defaultChecked={s ? !!s.status : true} />
              <Check label="Show on homepage" name="featured" defaultChecked={s ? !!s.featured : true} />
            </div>
          </div>
        </Card>
        <More title="More options (order, web address, Google)">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Position in menu" name="order_no" type="number" defaultValue={s?.order_no ?? 0} hint="Lower numbers come first." />
            <Field label="Position on homepage" name="home_order_no" type="number" defaultValue={s?.home_order_no ?? 0} />
          </div>
          <Field label="Web address (URL alias)" name="alias" defaultValue={s?.alias} hint="Leave empty and it is made from the name." />
          <Field label="Google title" name="meta_title" defaultValue={s?.meta_title ?? ''} maxLength={70} />
          <Field label="Google description" name="meta_description" defaultValue={s?.meta_description ?? ''} maxLength={170} />
        </More>
        <Save>{s ? 'Save collection' : 'Add collection'}</Save>
      </div>
    </form>
  );
}
