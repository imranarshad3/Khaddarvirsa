import Link from 'next/link';
import ProductForm from '../ProductForm';
import { H1, Notice, type SP } from '../../ui';

export const metadata = { title: 'New product' };

export default async function NewProduct({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Link href="/admin/products" className="text-primary">← Products</Link>
      <H1>New product</H1>
      <Notice sp={await searchParams} />
      <ProductForm />
    </>
  );
}
