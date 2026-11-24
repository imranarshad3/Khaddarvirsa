'use client';
import { useActionState } from 'react';
import { subscribe } from '@/app/actions';

export default function Newsletter() {
  const [state, action, pending] = useActionState(subscribe, null);
  return (
    <form action={action}>
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <div className="flex">
        <input id="nl-email" name="email" type="email" required placeholder="Your email address" className="field !border-white/20 !bg-transparent !text-white placeholder:text-white/50" />
        <button disabled={pending} className="bg-sand px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink hover:bg-white disabled:opacity-60">Subscribe</button>
      </div>
      {state && <p role="status" className={`mt-1 text-[14px] ${state.ok ? 'text-sand' : 'text-red-300'}`}>{state.message}</p>}
    </form>
  );
}
