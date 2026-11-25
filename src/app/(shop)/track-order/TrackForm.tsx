'use client';
import { useT } from '@/components/i18n/LangProvider';
import { useActionState } from 'react';
import { accountSignIn, trackOrder } from '@/app/actions';

const input = 'mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-[16px] text-ink outline-none transition placeholder:text-muted focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10';
const label = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2';

/** Order number + mobile form; `account` signs in to /account instead of opening one order. */
export default function TrackForm({ number, account = false }: { number: string; account?: boolean }) {
  const [state, action, pending] = useActionState(account ? accountSignIn : trackOrder, null);
  const t = useT();
  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="t-number" className={label}>{t('Order number')}</label>
        <input id="t-number" name="number" required defaultValue={number} placeholder="KK1A2B3C4D5E" autoCapitalize="characters" autoComplete="off" className={`${input} uppercase tracking-[0.12em]`} />
      </div>
      <div>
        <label htmlFor="t-phone" className={label}>{t('Mobile number')}</label>
        <input id="t-phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="03001234567" className={input} />
      </div>
      {state?.error && <p role="alert" className="rounded-2xl border border-sale/20 bg-sale/5 px-4 py-3 text-[14px] text-sale">{t(state.error)}</p>}
      <button disabled={pending} className="w-full rounded-full bg-ink py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-sand transition hover:bg-ink-2 disabled:opacity-60">
        {t(pending ? (account ? 'Signing in…' : 'Finding your order…') : (account ? 'View my orders' : 'Track order'))}
      </button>
    </form>
  );
}
