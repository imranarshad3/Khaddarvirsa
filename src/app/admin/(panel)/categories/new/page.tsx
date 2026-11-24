import { db } from '@/lib/db';
import type { Category } from '@/lib/catalog';
import { Back, H1, Notice, type SP } from '../../ui';
import SubForm from '../SubForm';

export const metadata = { title: 'Add collection' };

export default async function NewSub({ searchParams }: { searchParams: SP }) {
  const cats = (await db().prepare('SELECT * FROM categories ORDER BY order_no').all()) as Category[];
  return (
    <>
      <Back href="/admin/categories">Categories</Back>
      <H1>Add a collection</H1>
      <Notice sp={await searchParams} />
      <SubForm cats={cats} />
    </>
  );
}
