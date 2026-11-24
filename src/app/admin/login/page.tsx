import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  adminConfigured, checkPassword, clerkConfigured, clerkUserIsAdmin, isAdmin, loginThrottled, passwordConfigured, recordLoginFailure, startSession,
} from '@/lib/auth';
import ClerkAdminSignIn from './ClerkAdminSignIn';

export const metadata: Metadata = { title: 'Admin login', robots: { index: false } };

const clientIp = async () => (await headers()).get('x-forwarded-for')?.split(',')[0].trim() || 'local';

async function login(form: FormData) {
  'use server';
  const ip = await clientIp();
  if (loginThrottled(ip)) redirect('/admin/login?e=locked');
  if (!checkPassword(String(form.get('password') ?? ''))) {
    recordLoginFailure(ip);
    redirect('/admin/login?e=1');
  }
  await startSession();
  redirect('/admin');
}

async function clerkLogin(token: string): Promise<{ ok: true } | { ok: false; error: string }> {
  'use server';
  const ip = await clientIp();
  if (loginThrottled(ip)) return { ok: false, error: 'Too many attempts. Try again in 15 minutes.' };
  const r = await clerkUserIsAdmin(String(token ?? ''));
  if (r === 'ok') { await startSession(); return { ok: true }; }
  if (r === 'unavailable') return { ok: false, error: 'Could not check admin access right now. Please try again.' };
  recordLoginFailure(ip);
  return { ok: false, error: r === 'denied' ? 'This account is not a store administrator.' : 'Your sign-in could not be verified. Please sign in again.' };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string; out?: string }> }) {
  if (await isAdmin()) redirect('/admin');
  const { e, out } = await searchParams;
  const useClerk = clerkConfigured();
  return (
    <main className="flex min-h-screen items-center justify-center bg-soft p-4">
      <div className="w-full max-w-[420px] rounded bg-white p-6 shadow-card">
        <img src="/brand/favicon.svg" alt="" width={50} height={64} className="mx-auto mb-3 h-16 w-auto" />
        <h1 className="mb-4 text-center text-[20px]">Admin login</h1>
        {!adminConfigured() && (
          <p className="rounded bg-yellow-50 p-3 text-[13px] text-ink-2">
            The admin panel is disabled. Set <code>SESSION_SECRET</code> (32+ characters) and either the Clerk/Supabase keys or <code>ADMIN_PASSWORD</code> in the server environment and restart.
          </p>
        )}
        {useClerk && <ClerkAdminSignIn publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!} signIn={clerkLogin} signedOut={out === '1'} />}
        {passwordConfigured() && (
          <details open={!useClerk || Boolean(e)} className={useClerk ? 'mt-5 border-t border-line pt-4' : ''}>
            {useClerk && <summary className="cursor-pointer text-[13px] text-muted">Sign in with the store password instead</summary>}
            <form action={login} className="mt-3">
              {e && <p role="alert" className="mb-3 text-[13px] text-sale">{e === 'locked' ? 'Too many attempts. Try again in 15 minutes.' : 'Wrong password.'}</p>}
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" required autoFocus={!useClerk} autoComplete="current-password" className="field" />
              <button className="mt-4 h-10 w-full rounded bg-ink-2 text-white">Log in</button>
            </form>
          </details>
        )}
      </div>
    </main>
  );
}
