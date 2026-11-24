import ConfirmButton from '../../ConfirmButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Category, SubCategory } from '@/lib/catalog';
import { deleteSubCategory } from '../../../actions';
import { Card, H1, Notice, type SP } from '../../ui';
import SubForm from '../SubForm';

export const metadata = { title: 'Edit collection' };

export default async function EditSub({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const s = (await db().prepare('SELECT * FROM sub_categories WHERE id = ?').get(Number((await params).id))) as SubCategory | undefined;
  if (!s) notFound();
  const cats = (await db().prepare('SELECT * FROM categories ORDER BY order_no').all()) as Category[];
  return (
    <>
      <Link href="/admin/categories" className="text-primary">← Categories</Link>
      <H1>{s.name} <Link href={`/product-category/${s.alias}`} target="_blank" className="text-[13px] font-normal text-primary">View ↗</Link></H1>
      <Notice sp={await searchParams} />
      <Card><SubForm s={s} cats={cats} /></Card>
      <Link href={`/admin/products?sub=${s.id}`} className="text-primary">Products in this collection →</Link>
      <form action={deleteSubCategory} className="mt-6 border-t pt-4">
        <input type="hidden" name="id" value={s.id} />
        <ConfirmButton message="Delete this collection permanently?" className="rounded-full border border-sale px-5 py-2 text-sale hover:bg-red-50">Delete collection</ConfirmButton>
        <span className="ml-2 text-[12px] text-muted">Only possible when it has no products.</span>
      </form>
    </>
  );
}
