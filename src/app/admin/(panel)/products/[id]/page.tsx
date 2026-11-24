import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Product } from '@/lib/catalog';
import ProductForm from '../ProductForm';
import { duplicateProduct } from '../../../actions';
import { Back, BTN, H1, Notice, type SP } from '../../ui';

export const metadata = { title: 'Edit product' };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const p = (await db().prepare('SELECT * FROM products WHERE id = ?').get(Number((await params).id))) as Product | undefined;
  if (!p) notFound();
  return (
    <>
      <Back href="/admin/products">All products</Back>
      <H1><span className="min-w-0 flex-1 basis-64">{p.title}{p.hidden ? <span className="ml-3 rounded-full bg-gray-200 px-2.5 py-0.5 align-middle font-sans text-[12px] text-gray-700">Hidden</span> : null}</span>
        <span className="flex flex-wrap gap-2 font-sans">
          <Link href={`/product/${p.alias}`} target="_blank" className={BTN}>View in shop ↗</Link>
          <form action={duplicateProduct}><input type="hidden" name="id" value={p.id} /><button className={BTN}>Duplicate</button></form>
        </span></H1>
      <Notice sp={await searchParams} />
      <ProductForm p={p} />
    </>
  );
}
