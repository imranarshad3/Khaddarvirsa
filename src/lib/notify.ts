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

/** Builds the plain-text customer order confirmation email. */
export function customerConfirmationEmail(o: NonNullable<Awaited<ReturnType<typeof orderByNumber>>>, storeName: string) {
  const rs = (n: number) => 'Rs ' + Number(n).toLocaleString('en-PK');
  const paymentText = o.payment_method === 'cod' ? 'Cash on Delivery (Pay when parcel arrives)' : 'Direct Bank Transfer';
  return [
    `Salam ${o.name},`,
    '',
    `Thank you for ordering with ${storeName}! Your order has been received and is being prepared for dispatch.`,
    '',
    `Order Number: ${o.number}`,
    `Payment Method: ${paymentText}`,
    `Total Amount: ${rs(o.total)}`,
    '',
    `Delivery Address:`,
    `${o.address}, ${o.city}`,
    `Mobile: ${o.phone}`,
    '',
    `Items Ordered:`,
    ...o.items.map((it) => `• ${it.title}${it.code ? ` (${it.code})` : ''} × ${it.qty} = ${rs(it.unit_price * it.qty)}`),
    '',
    `We will call you on ${o.phone} to confirm before courier dispatch.`,
    `Track your parcel anytime: ${siteUrl()}/order/${o.number}`,
    '',
    `If you need any help, reply to this email or message us on WhatsApp: wa.me/923424307737`,
    '',
    `Warm regards,`,
    `${storeName} Team`,
  ].join('\n');
}

/** Sends order notifications: alerts store admin and sends customer confirmation receipt (Resend); also alerts admin via WhatsApp (CallMeBot). Never throws. */
export async function notifyNewOrder(number: string) {
  try {
    const [o, s] = await Promise.all([orderByNumber(number), getSettings()]);
    if (!o) return;
    const text = orderAlertText(o, `${siteUrl()}/admin/orders`);
    const to = s.contact.email[0];
    const phone = s.whatsapp_number.replace(/\D/g, '');
    const jobs: Promise<unknown>[] = [];
    const fromEmail = process.env.ORDER_EMAIL_FROM || `${s.store_name} <onboarding@resend.dev>`;

    if (process.env.RESEND_API_KEY) {
      // 1. Notify store admin
      if (to) {
        jobs.push(fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromEmail, to, subject: `New order ${o.number} · Rs ${o.total}`, text }),
        }).then(async (r) => { if (!r.ok) throw new Error(`Admin Resend ${r.status}: ${await r.text()}`); }));
      }

      // 2. Notify customer (Transactional Confirmation)
      if (o.email) {
        const customerText = customerConfirmationEmail(o, s.store_name);
        jobs.push(fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: o.email,
            subject: `Order Confirmation: ${o.number} · ${s.store_name}`,
            text: customerText,
          }),
        }).then(async (r) => { if (!r.ok) throw new Error(`Customer Resend ${r.status}: ${await r.text()}`); }));
      }
    }

    if (process.env.CALLMEBOT_APIKEY && phone) {
      jobs.push(fetch(`https://api.callmebot.com/whatsapp.php?${new URLSearchParams({ phone, text, apikey: process.env.CALLMEBOT_APIKEY })}`)
        .then((r) => { if (!r.ok) throw new Error(`CallMeBot ${r.status}`); }));
    }

    for (const r of await Promise.allSettled(jobs)) {
      if (r.status === 'rejected') console.error('order alert failed', number, r.reason);
    }
  } catch (e) {
    console.error('notifyNewOrder failed', number, e);
  }
}
