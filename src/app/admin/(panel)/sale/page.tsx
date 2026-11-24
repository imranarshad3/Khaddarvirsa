import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { saleProducts } from '@/lib/catalog';
import { saveSalePage } from '../../actions';
import { Area, Card, Check, Field, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Sale page' };

// ISO with +05:00 → the "YYYY-MM-DDTHH:mm" a datetime-local input shows, in Pakistan time.
const toLocal = (iso: string) => (iso ? new Date(new Date(iso).getTime() + 5 * 3600e3).toISOString().slice(0, 16) : '');

export default async function SalePage({ searchParams }: { searchParams: SP }) {
  const s = await getSettings();
  const count = (await saleProducts()).length;
  const ended = s.sale_ends_at && new Date(s.sale_ends_at).getTime() < Date.now();
  return (
    <>
      <H1>Sale page <Link href="/today-sale" target="_blank" className="font-sans text-[14px] text-primary">View ↗</Link></H1>
      <Notice sp={await searchParams} />
      <p className="mb-5 text-[15px]">
        {count} product(s) are on sale. Put a product on sale from <Link href="/admin/products" className="text-primary underline">Products</Link> (tick “On sale” and set a sale price).
        {ended && <strong className="text-sale"> The countdown has ended: set a new end time or clear it.</strong>}
      </p>
      <form action={saveSalePage}>
        <Card title="Menu link">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Check label="Show the sale link in the website menu" name="sale_enabled" defaultChecked={s.sale_enabled} /></div>
            <Field label="Sale title (menu and page heading)" name="sale_title" defaultValue={s.sale_title} placeholder="e.g. 11.11 Sale" required />
            <Field label="Sale colour" name="sale_color" type="color" defaultValue={s.sale_color} />
          </div>
        </Card>
        <Card title="Page banner">
          <div className="grid gap-3">
            <Field label="Headline" name="sale_headline" defaultValue={s.sale_headline} maxLength={120} placeholder="e.g. Flat 30% off on winter khaddar" hint="Leave empty to show only the sale title." />
            <Area label="Short text under the headline" name="sale_text" rows={2} maxLength={400} defaultValue={s.sale_text} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ends at (Pakistan time)" name="sale_ends_at" type="datetime-local" defaultValue={toLocal(s.sale_ends_at)} hint="Shows a live countdown. Leave empty for no countdown." />
              <div>
                <Field label="Banner photo" name="banner" type="file" accept="image/jpeg,image/png,image/webp" hint="Wide photo, at least 1600px across. Max 4 MB." />
                <input type="hidden" name="sale_banner" value={s.sale_banner} />
              </div>
            </div>
            {s.sale_banner && (
              <div className="flex items-center gap-4">
                <img src={s.sale_banner} alt="Current sale banner" className="h-20 w-40 rounded-lg object-cover" />
                <Check label="Remove this photo" name="remove_banner" />
              </div>
            )}
          </div>
        </Card>
        <Save>Save sale page</Save>
      </form>
    </>
  );
}
