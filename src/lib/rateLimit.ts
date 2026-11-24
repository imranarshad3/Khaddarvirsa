import 'server-only';
import { headers } from 'next/headers';
import { db } from './db';

/** Visitor IP as Vercel reports it (first x-forwarded-for entry). */
export async function clientIp() {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local';
}

/**
 * Counts one attempt for `key` in a fixed window and returns the count so far.
 * Stored in the database so every server instance shares the same counters.
 */
export async function hit(key: string, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const row = (await db().prepare(`INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
      reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END
    RETURNING count`).get(key, now + windowSec, now, now)) as { count: number };
  if (Math.random() < 0.02) await db().prepare('DELETE FROM rate_limits WHERE reset_at <= ?').run(now);
  return Number(row.count);
}

/** Current count for `key` without adding to it (0 once its window has passed). */
export async function peek(key: string) {
  const row = (await db().prepare('SELECT count FROM rate_limits WHERE key = ? AND reset_at > ?')
    .get(key, Math.floor(Date.now() / 1000))) as { count: number } | undefined;
  return Number(row?.count ?? 0);
}
