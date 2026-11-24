import 'server-only';
import { orderByNumber } from './orders';
import { getSettings, siteUrl } from './settings';

/** Builds the plain-text alert for a new order (plain text, so customer input can't inject HTML). */
export function orderAlertText(o: NonNullable<Awaited<ReturnType<typeof orderByNumber>>>, admin: string) {
  const rs = (n: number) => 'Rs ' + Number(n).toLocaleString('en-PK');
  return [
    `New order ${o.number}`,
    `${o.name} · ${o.phone}${o.email ? ' · ' + o.email : ''}`,
    `${o.city} — ${o.address}`,
    ...o.items.map((it) => `• ${it.title}${it.code ? ` (${it.code})` : ''} × ${it.qty} = ${rs(it.unit_price * it.qty)}`),
    `Total: ${rs(o.total)} (${o.payment_method})`,
    o.remarks ? `Note: ${o.remarks}` : '',
    admin,
  ].filter(Boolean).join('\n');
}

/** Sends the store an email (Resend) and a WhatsApp message (CallMeBot); each is skipped when its key is unset. Never throws. */
export async function notifyNewOrder(number: string) {
  try {
    const [o, s] = await Promise.all([orderByNumber(number), getSettings()]);
    if (!o) return;
    const text = orderAlertText(o, `${siteUrl()}/admin/orders`);
    const to = s.contact.email[0];
    const phone = s.whatsapp_number.replace(/\D/g, '');
    const jobs: Promise<unknown>[] = [];
    if (process.env.RESEND_API_KEY && to)
      jobs.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.ORDER_EMAIL_FROM || `${s.store_name} <onboarding@resend.dev>`, to, subject: `New order ${o.number} · Rs ${o.total}`, text }),
      }).then(async (r) => { if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`); }));
    if (process.env.CALLMEBOT_APIKEY && phone)
      jobs.push(fetch(`https://api.callmebot.com/whatsapp.php?${new URLSearchParams({ phone, text, apikey: process.env.CALLMEBOT_APIKEY })}`)
        .then((r) => { if (!r.ok) throw new Error(`CallMeBot ${r.status}`); }));
    for (const r of await Promise.allSettled(jobs)) if (r.status === 'rejected') console.error('order alert failed', number, r.reason);
  } catch (e) {
    console.error('notifyNewOrder failed', number, e);
  }
}
