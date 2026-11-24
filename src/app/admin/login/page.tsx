import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clientIp } from '@/lib/rateLimit';
import {
  adminConfigured, checkPassword, clerkConfigured, clerkUserIsAdmin, isAdmin, loginThrottled, passwordConfigured, recordLoginFailure, startSession,
} from '@/lib/auth';
import ClerkAdminSignIn from './ClerkAdminSignIn';
import { loginButton, loginInput, loginLabel } from './styles';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false } };

async function login(form: FormData) {
  'use server';
  const ip = await clientIp();
  if (await loginThrottled(ip)) redirect('/admin/login?e=locked');
  if (!checkPassword(String(form.get('password') ?? ''))) {
    await recordLoginFailure(ip);
    redirect('/admin/login?e=1');
  }
  await startSession();
  redirect('/admin');
}

async function clerkLogin(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
  'use server';
  const ip = await clientIp();
  if (await loginThrottled(ip)) return { ok: false, error: 'Too many attempts. Try again in 15 minutes.' };
  const r = await clerkUserIsAdmin(String(token ?? ''));
  if (r === 'ok') { await startSession(); return { ok: true }; }
  if (r === 'unavailable') return { ok: false, error: 'Could not check admin access right now. Please try again.' };
  await recordLoginFailure(ip);
  return { ok: false, error: r === 'denied' ? 'This account is not a store administrator.' : 'Your sign-in could not be verified. Please sign in again.' };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string; out?: string }> }) {
  if (await isAdmin()) redirect('/admin');
  const { e, out } = await searchParams;
  const useClerk = clerkConfigured();
  return (
    <main lang="en" dir="ltr" className="grid min-h-screen bg-paper lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src="/hero/product-craft-courtyard.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-sand">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Store dashboard</p>
          <p className="mt-3 max-w-md font-display text-[40px] leading-tight text-white">Orders, products and pages, all in one place.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <img src="/brand/khaddar-virsa-logo-hq.png" alt="Khaddar Virsa" width={1188} height={864} className="mx-auto mb-6 h-20 w-auto" />
          <h1 className="text-center font-display text-[32px] text-ink">Welcome back</h1>
          <p className="mb-8 mt-1 text-center text-[15px] text-muted">Sign in to manage your store.</p>
          {!adminConfigured() && (
            <p className="rounded-xl bg-yellow-50 p-3 text-[13px] text-ink-2">
              The admin panel is disabled. Set <code>SESSION_SECRET</code> (32+ characters) and either the Clerk/Supabase keys or <code>ADMIN_PASSWORD</code> in the server environment and restart.
            </p>
          )}
          {useClerk && <ClerkAdminSignIn publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!} signIn={clerkLogin} signedOut={out === '1'} />}
          {passwordConfigured() && (
            <details open={!useClerk || Boolean(e)} className={useClerk ? 'mt-8 border-t border-line pt-5 text-center' : ''}>
              {useClerk && <summary className="cursor-pointer list-none text-[13px] text-muted hover:text-ink">Sign in with the store password instead</summary>}
              <form action={login} className="mt-4 space-y-4 text-left">
                {e && <p role="alert" className="rounded-xl bg-red-50 p-3 text-[14px] text-sale">{e === 'locked' ? 'Too many attempts. Try again in 15 minutes.' : 'Wrong password.'}</p>}
                <div>
                  <label htmlFor="password" className={loginLabel}>Store password</label>
                  <input id="password" name="password" type="password" required autoFocus={!useClerk} autoComplete="current-password" className={loginInput} />
                </div>
                <button className={loginButton}>Sign in</button>
              </form>
            </details>
          )}
          <p className="mt-10 text-center text-[12px] text-muted"><Link href="/" className="hover:text-ink">← Back to the shop</Link></p>
        </div>
      </div>
    </main>
  );
}
