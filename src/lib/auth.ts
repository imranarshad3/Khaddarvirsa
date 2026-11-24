import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hit, peek } from './rateLimit';

const COOKIE = 'kk_admin';
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

const passwordConfigured = () => Boolean(process.env.ADMIN_PASSWORD && secret());

/** Clerk sign-in (same Clerk + Supabase as Rugistan): a Clerk user whose Supabase profiles.role is 'admin'. */
export function clerkConfigured() {
  const e = process.env;
  return Boolean(secret() && e.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && e.CLERK_SECRET_KEY && e.SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY);
}

export function adminConfigured() {
  return passwordConfigured() || clerkConfigured();
}

export { passwordConfigured };

const sign = (payload: string) => crypto.createHmac('sha256', secret()!).update(payload).digest('base64url');

function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function checkPassword(pw: string) {
  return passwordConfigured() && safeEqual(pw, process.env.ADMIN_PASSWORD!);
}

export async function startSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
}

function allowedOrigins() {
  // VERCEL_URL / VERCEL_BRANCH_URL let admin sign-in work on preview deployments too.
  const vercel = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean).map((h) => `https://${h}`);
  const list = [process.env.SITE_URL, ...vercel, ...(process.env.ADMIN_ALLOWED_ORIGINS || '').split(',')]
    .map((u) => { try { return u ? new URL(u.trim()).origin : ''; } catch { return ''; } }).filter(Boolean);
  if (process.env.NODE_ENV !== 'production') list.push('http://localhost:3000', 'http://127.0.0.1:3000');
  return [...new Set(list)];
}

/** Verifies a Clerk session token, then reads the user's role from Supabase (read-only). Never trusts the browser's claim of being admin. */
export async function clerkUserIsAdmin(token: string): Promise<'ok' | 'denied' | 'invalid' | 'unavailable'> {
  if (!clerkConfigured() || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return 'invalid';
  let userId: string;
  try {
    const { verifyToken } = await import('@clerk/backend');
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY!, authorizedParties: allowedOrigins() });
    if (!claims.sid || !claims.sub.startsWith('user_')) return 'invalid';
    userId = claims.sub;
  } catch { return 'invalid'; }
  const url = `${process.env.SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(userId)}`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  try {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!r.ok) return 'unavailable';
    const rows = (await r.json()) as { role?: string }[];
    return rows[0]?.role === 'admin' ? 'ok' : 'denied';
  } catch { return 'unavailable'; }
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split('.');
  return Boolean(exp && sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now() / 1000);
}

/** Call at the top of every admin page and every admin server action / route. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

// Shared across server instances via the rate_limits table: 5 failed sign-ins lock an IP out for 15 minutes.
export async function loginThrottled(ip: string) {
  return (await peek(`login:${ip}`)) >= 5;
}
export async function recordLoginFailure(ip: string) {
  await hit(`login:${ip}`, 15 * 60);
}
