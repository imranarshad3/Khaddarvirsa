import { db } from '@/lib/db';
import { deleteSubscriber } from '../../actions';
import { Card, H1, Notice, type SP } from '../ui';
import ConfirmButton from '../ConfirmButton';

export const metadata = { title: 'Subscribers' };

export default async function Subscribers({ searchParams }: { searchParams: SP }) {
  const rows = (await db().prepare('SELECT id, email, created_at FROM subscribers ORDER BY id DESC').all()) as { id: number; email: string; created_at: string }[];
  return (
    <>
      <H1>Newsletter subscribers ({rows.length})
        {rows.length > 0 && <a download href="/admin/export/subscribers" className="ml-auto rounded-full border border-line bg-white px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-gold">Download CSV</a>}</H1>
      <Notice sp={await searchParams} />
      <Card>
        {rows.length ? (
          <>
            <p className="mb-2 text-muted">No email service is connected; download the CSV or copy the list below into your mailing tool.</p>
            <textarea readOnly rows={Math.min(12, rows.length + 1)} aria-label="All subscriber emails" className="field mb-3 font-mono text-[12px]" defaultValue={rows.map((r) => r.email).join('\n')} />
            <table className="w-full text-left"><tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-1.5">{r.email}</td><td className="text-muted">{r.created_at.slice(0, 10)}</td>
                  <td className="text-right"><form action={deleteSubscriber}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message={`Remove ${r.email}?`} className="text-[13px] text-sale hover:underline">Remove</ConfirmButton></form></td>
                </tr>
              ))}
            </tbody></table>
          </>
        ) : <p>No subscribers yet.</p>}
      </Card>
    </>
  );
}
