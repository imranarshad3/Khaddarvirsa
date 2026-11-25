'use client';
// Submit button that asks first, so one stray click cannot delete data.
export default function ConfirmButton({ message, children, ...rest }: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>
  );
}
