import ProductForm from '../ProductForm';
import { Back, H1, Notice, type SP } from '../../ui';

export const metadata = { title: 'New product' };

export default async function NewProduct({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Back href="/admin/products">All products</Back>
      <H1>Add a product</H1>
      <Notice sp={await searchParams} />
      <ProductForm />
    </>
  );
}
