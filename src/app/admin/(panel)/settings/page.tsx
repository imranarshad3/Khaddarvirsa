import { getSettings } from '@/lib/settings';
import { saveStoreSettings } from '../../actions';
import { Area, Card, Field, H1, Notice, Save, type SP } from '../ui';

export const metadata = { title: 'Settings & SEO' };

export default async function SettingsPage({ searchParams }: { searchParams: SP }) {
  const s = getSettings();
  return (
    <>
      <H1>Settings &amp; SEO</H1>
      <Notice sp={await searchParams} />
      <form action={saveStoreSettings}>
        <Card title="Store">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Store name" name="store_name" defaultValue={s.store_name} />
            <Field label="WhatsApp number" name="whatsapp_number" defaultValue={s.whatsapp_number} placeholder="03XXXXXXXXX" />
            <div className="sm:col-span-2"><Area label="Announcement bar — one message per line (they rotate)" name="top_bar_text" rows={3} defaultValue={s.top_bar_text.join('\n')} /></div>
            <Field label="Sale menu title" name="sale_title" defaultValue={s.sale_title} />
            <Field label="Sale menu colour" name="sale_color" type="color" defaultValue={s.sale_color} />
          </div>
        </Card>
        <Card title="Delivery">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Delivery charges (Rs)" name="shipping_charges" type="number" min={0} defaultValue={s.shipping_charges} />
            <Field label="Free delivery on orders from (Rs)" name="free_shipping_over" type="number" min={0} defaultValue={s.free_shipping_over} hint="0 = never free." />
          </div>
        </Card>
        <Card title="Contact">
          <div className="grid gap-3 sm:grid-cols-3">
            <Area label="Address lines" name="address" defaultValue={s.contact.address.join('\n')} />
            <Area label="Phone numbers, one per line" name="phone" defaultValue={s.contact.phone.join('\n')} />
            <Area label="Emails, one per line" name="email" defaultValue={s.contact.email.join('\n')} />
          </div>
          <div className="mt-3"><Area label="Social links — one per line: icon | label | URL" name="social" defaultValue={s.social.map((x) => `${x.key} | ${x.name} | ${x.link}`).join('\n')}
            hint="Icons: facebook, instagram, youtube, tiktok, twitter, linkedin." /></div>
        </Card>
        <Card title="Bank transfer">
          <div className="grid gap-3">
            <Area label="Accounts — one per line: bank | account title | account number | IBAN" name="bank_details"
              defaultValue={s.bank_details.map((b) => `${b.bank} | ${b.account_title} | ${b.account_number} | ${b.iban}`).join('\n')}
              hint="Shown at checkout and on the order page when the customer picks bank transfer." />
            <Area label="Note for bank transfer customers" name="bank_note" rows={2} defaultValue={s.bank_note} />
          </div>
        </Card>
        <Card title="Search engines (homepage)">
          <div className="grid gap-3">
            <Field label="Site title" name="seo_title" defaultValue={s.seo_title} maxLength={70} />
            <Area label="Site description" name="seo_description" rows={2} defaultValue={s.seo_description} maxLength={170} />
          </div>
        </Card>
        <Save>Save settings</Save>
      </form>
    </>
  );
}
