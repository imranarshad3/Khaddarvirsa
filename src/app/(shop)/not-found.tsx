import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-kk py-20 text-center">
      <h1 className="text-[28px]">Page not found</h1>
      <p className="mt-2">The page or product you are looking for is not available.</p>
      <Link href="/" className="mt-6 inline-block rounded bg-primary px-6 py-2.5 text-white">Back to home</Link>
    </div>
  );
}
