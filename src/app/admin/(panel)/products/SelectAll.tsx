'use client';
/** Ticks or clears every product checkbox (name="sel") in the same form. */
export default function SelectAll() {
  return (
    <input type="checkbox" aria-label="Select all products on this page" className="h-4 w-4 accent-[#795536]"
      onChange={(e) => e.currentTarget.form?.querySelectorAll<HTMLInputElement>('input[name="sel"]').forEach((c) => { c.checked = e.currentTarget.checked; })} />
  );
}
