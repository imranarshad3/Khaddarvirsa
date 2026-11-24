'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClerkProvider, useAuth, useClerk, useSignIn } from '@clerk/react';
import { loginButton, loginInput, loginLabel } from './styles';

type Result = { ok: true } | { ok: false; error: string };
type Step = 'password' | 'email-code' | 'second-factor';

const linkBtn = 'text-[13px] text-gold-dark underline-offset-4 hover:underline';

const msg = (e: { longMessage?: string; message: string } | null) => (e ? e.longMessage || e.message : '');

/** Our own sign-in form on top of Clerk's sign-in API: email + password, an emailed code instead, and the second step when the account asks for one. */
function Form() {
  const { signIn, fetchStatus } = useSignIn();
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [second, setSecond] = useState<'email_code' | 'phone_code' | 'totp'>('email_code');
  const [error, setError] = useState('');
  const busy = fetchStatus === 'fetching';

  // Moves on after a factor is accepted: done, or a second step (also used to trust a new device).
  async function next() {
    if (signIn.status === 'complete') { await signIn.finalize(); return; }
    if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
      const kinds = signIn.supportedSecondFactors.map((f) => f.strategy);
      const pick = kinds.includes('email_code') ? 'email_code' : kinds.includes('phone_code') ? 'phone_code' : kinds.includes('totp') ? 'totp' : null;
      if (!pick) return setError('This account needs a sign-in step this page does not support. Use the store password instead.');
      if (pick === 'email_code') { const r = await signIn.mfa.sendEmailCode(); if (r.error) return setError(msg(r.error)); }
      if (pick === 'phone_code') { const r = await signIn.mfa.sendPhoneCode(); if (r.error) return setError(msg(r.error)); }
      setSecond(pick);
      setStep('second-factor');
      return;
    }
    setError('Sign-in could not be completed. Please try again.');
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const r = await signIn.password({ identifier: email.trim(), password: String(f.get('password')) });
    if (r.error) return setError(msg(r.error));
    await next();
  }

  async function sendEmailCode() {
    setError('');
    if (!email.trim()) return setError('Enter your email first.');
    const c = await signIn.create({ identifier: email.trim() });
    if (c.error) return setError(msg(c.error));
    const r = await signIn.emailCode.sendCode();
    if (r.error) return setError(msg(r.error));
    setStep('email-code');
  }

  async function onCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const code = String(new FormData(e.currentTarget).get('code')).trim();
    const r = step === 'email-code' ? await signIn.emailCode.verifyCode({ code })
      : second === 'email_code' ? await signIn.mfa.verifyEmailCode({ code })
      : second === 'phone_code' ? await signIn.mfa.verifyPhoneCode({ code })
      : await signIn.mfa.verifyTOTP({ code });
    if (r.error) return setError(msg(r.error));
    await next();
  }

  const back = () => { signIn.reset(); setError(''); setStep('password'); };
  const err = error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-[14px] text-sale">{error}</p>;

  if (step !== 'password') {
    const where = step === 'email-code' || second === 'email_code' ? `the code we emailed to ${email}` : second === 'phone_code' ? 'the code we sent to your phone' : 'the code from your authenticator app';
    return (
      <form onSubmit={onCode} className="space-y-4" key={step}>
        <p className="text-center text-[15px]">Enter {where}.</p>
        <div>
          <label htmlFor="code" className={loginLabel}>Verification code</label>
          <input id="code" name="code" required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={8} className={`${loginInput} text-center text-[22px] tracking-[0.5em]`} />
        </div>
        {err}
        <button disabled={busy} className={loginButton}>{busy ? 'Checking…' : 'Verify and sign in'}</button>
        <p className="text-center"><button type="button" onClick={back} className={linkBtn}>Use a different email</button></p>
      </form>
    );
  }

  return (
    <form onSubmit={onPassword} className="space-y-4">
      <div>
        <label htmlFor="email" className={loginLabel}>Email</label>
        <input id="email" type="email" required autoFocus autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={loginInput} />
      </div>
      <div>
        <label htmlFor="pw" className={loginLabel}>Password</label>
        <input id="pw" name="password" type="password" required autoComplete="current-password" className={loginInput} />
      </div>
      {err}
      <button disabled={busy} className={loginButton}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="text-center"><button type="button" onClick={sendEmailCode} disabled={busy} className={linkBtn}>Email me a sign-in code instead</button></p>
      {/* Clerk's bot protection mounts here when it is turned on for the instance. */}
      <div id="clerk-captcha" />
    </form>
  );
}

function Inner({ signIn, signedOut }: { signIn: (token: string) => Promise<Result>; signedOut: boolean }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [error, setError] = useState('');
  const tried = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    // After "Log out" in the panel, end the Clerk session too, or it would sign straight back in.
    if (signedOut && isSignedIn) { signOut({ redirectUrl: '/admin/login' }); return; }
    if (!isSignedIn || tried.current) return;
    tried.current = true;
    (async () => {
      const token = await getToken();
      const r = token ? await signIn(token) : { ok: false as const, error: 'Could not read your session. Please sign in again.' };
      if (r.ok) router.replace('/admin');
      else setError(r.error);
    })();
  }, [isLoaded, isSignedIn, signedOut, getToken, signIn, signOut, router]);

  if (!isLoaded) return <div className="space-y-4" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-soft" />)}</div>;
  if (isSignedIn) {
    return error ? (
      <div className="space-y-3 text-center">
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-[14px] text-sale">{error}</p>
        <button type="button" onClick={() => { tried.current = false; signOut({ redirectUrl: '/admin/login' }); }} className="h-12 w-full rounded-full border border-ink text-[12px] font-semibold uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-white">Use another account</button>
      </div>
    ) : <p className="py-6 text-center text-[14px] text-muted">Checking admin access…</p>;
  }
  return <Form />;
}

export default function ClerkAdminSignIn({ publishableKey, signIn, signedOut }: { publishableKey: string; signIn: (token: string) => Promise<Result>; signedOut: boolean }) {
  return <ClerkProvider publishableKey={publishableKey}><Inner signIn={signIn} signedOut={signedOut} /></ClerkProvider>;
}
