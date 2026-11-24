import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Product } from '@/lib/catalog';
import ProductForm from '../ProductForm';
import { duplicateProduct } from '../../../actions';
import { H1, Notice, type SP } from '../../ui';

export const metadata = { title: 'Edit product' };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const p = (await db().prepare('SELECT * FROM products WHERE id = ?').get(Number((await params).id))) as Product | undefined;
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/products" className="text-primary">← Products</Link>
      <H1>{p.title} <Link href={`/product/${p.alias}`} target="_blank" className="text-[13px] font-normal text-primary">View ↗</Link>
        <form action={duplicateProduct} className="ml-auto"><input type="hidden" name="id" value={p.id} />
          <button className="rounded-full border border-line bg-white px-4 py-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-gold">Duplicate as draft</button></form></H1>
      <Notice sp={await searchParams} />
      <ProductForm p={p} />
    </>
  );
}
