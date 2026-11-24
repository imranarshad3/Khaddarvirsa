import ConfirmButton from '../../ConfirmButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Category, SubCategory } from '@/lib/catalog';
import { deleteSubCategory } from '../../../actions';
import { Back, BTN, H1, Notice, type SP } from '../../ui';
import SubForm from '../SubForm';

export const metadata = { title: 'Edit collection' };

export default async function EditSub({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const s = (await db().prepare('SELECT * FROM sub_categories WHERE id = ?').get(Number((await params).id))) as SubCategory | undefined;
  if (!s) notFound();
  const cats = (await db().prepare('SELECT * FROM categories ORDER BY order_no').all()) as Category[];
  return (
    <>
      <Back href="/admin/categories">Categories</Back>
      <H1><span className="min-w-0 flex-1 basis-64">{s.name}</span>
        <span className="flex flex-wrap gap-2 font-sans">
          <Link href={`/admin/products?sub=${s.id}`} className={BTN}>Its products</Link>
          <Link href={`/product-category/${s.alias}`} target="_blank" className={BTN}>View in shop ↗</Link>
        </span></H1>
      <Notice sp={await searchParams} />
      <SubForm s={s} cats={cats} />
      <form action={deleteSubCategory} className="mt-8 rounded-2xl border border-red-200/70 bg-red-50/40 p-5">
        <input type="hidden" name="id" value={s.id} />
        <ConfirmButton message="Delete this collection permanently?" className="rounded-full border border-sale px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-sale hover:bg-red-50">Delete collection</ConfirmButton>
        <span className="ml-2 text-[12px] text-muted">Only possible when it has no products.</span>
      </form>
    </>
  );
}
