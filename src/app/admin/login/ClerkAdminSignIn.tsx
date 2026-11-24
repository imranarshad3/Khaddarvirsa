'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClerkProvider, SignIn, useAuth, useClerk } from '@clerk/react';

type Result = { ok: true } | { ok: false; error: string };

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

  if (!isLoaded) return <p className="text-center text-[13px] text-muted">Loading sign-in…</p>;
  if (isSignedIn) {
    return error ? (
      <div className="text-center">
        <p role="alert" className="mb-3 text-[13px] text-sale">{error}</p>
        <button type="button" onClick={() => { tried.current = false; signOut({ redirectUrl: '/admin/login' }); }} className="h-10 w-full rounded border border-line">Use another account</button>
      </div>
    ) : <p className="text-center text-[13px] text-muted">Checking admin access…</p>;
  }
  return <div className="flex justify-center"><SignIn routing="hash" forceRedirectUrl="/admin/login" /></div>;
}

export default function ClerkAdminSignIn({ publishableKey, signIn, signedOut }: { publishableKey: string; signIn: (token: string) => Promise<Result>; signedOut: boolean }) {
  return <ClerkProvider publishableKey={publishableKey}><Inner signIn={signIn} signedOut={signedOut} /></ClerkProvider>;
}
