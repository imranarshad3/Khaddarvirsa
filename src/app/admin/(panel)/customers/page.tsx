import Link from 'next/link';
import { db } from '@/lib/db';
import { rs } from '@/lib/pricing';
import { Card, H1, type SP } from '../ui';

export const metadata = { title: 'Customers' };

// The shop has guest checkout only, so a "customer" is everyone who ordered with the same phone number.
export default async function Customers({ searchParams }: { searchParams: SP }) {
  const { q = '' } = await searchParams;
  const like = `%${q.trim()}%`;
  const rows = db().prepare(`SELECT phone, MAX(name) name, MAX(email) email, MAX(city) city, COUNT(*) orders,
      SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) spent, MAX(created_at) last
    FROM orders WHERE phone LIKE ? OR name LIKE ? OR email LIKE ? GROUP BY phone ORDER BY last DESC LIMIT 300`)
    .all(like, like, like) as { phone: string; name: string; email: string | null; city: string; orders: number; spent: number; last: string }[];
  return (
    <>
      <H1>Customers</H1>
      <p className="mb-3 text-muted">Built from orders, grouped by phone number. There are no customer accounts.</p>
      <form className="mb-3 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Name, phone or email" aria-label="Search customers" className="field w-[240px]" />
        <button className="rounded bg-ink-2 px-3 text-white">Search</button>
      </form>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b text-[12px] uppercase text-muted"><tr><th className="py-2">Name</th><th>Phone</th><th>Email</th><th>City</th><th>Orders</th><th className="text-right">Spent</th><th className="pl-3">Last order</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.phone} className="border-b last:border-0">
                  <td className="py-2">{r.name}</td>
                  <td><Link href={`/admin/orders?q=${encodeURIComponent(r.phone)}`} className="text-primary">{r.phone}</Link></td>
                  <td>{r.email || '—'}</td><td>{r.city}</td><td>{r.orders}</td><td className="text-right">{rs(r.spent)}</td><td className="pl-3">{r.last.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p>No customers yet.</p>}
        </div>
      </Card>
    </>
  );
}
