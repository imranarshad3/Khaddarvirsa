'use client';
import { useRef, useState } from 'react';

/** Photo field with live preview: click or drop a file. Posts as `name` (a File), so the server actions stay unchanged. */
export default function ImagePicker({ name = 'image', current, round = false, label = 'Photo' }: { name?: string; current?: string | null; round?: boolean; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  function pick(files: FileList | null) {
    const f = files?.[0];
    setError('');
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) return setError('Use a JPG, PNG, WebP or GIF photo.');
    if (f.size > 4 * 1024 * 1024) return setError('This photo is over 4 MB. Please pick a smaller one.');
    if (input.current && files !== input.current.files) { const dt = new DataTransfer(); dt.items.add(f); input.current.files = dt.files; }
    setPreview(URL.createObjectURL(f));
  }

  const src = preview ?? current;
  return (
    <div>
      <p className="label">{label}</p>
      <button type="button" onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}
        className={`group relative flex w-full items-center justify-center overflow-hidden border-2 border-dashed bg-[#fffdf9] transition ${round ? 'mx-auto aspect-square max-w-[220px] rounded-full' : 'aspect-square rounded-2xl'} ${drag ? 'border-gold bg-soft' : 'border-line hover:border-gold'}`}>
        {src ? <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <span className={`relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-center text-[13px] font-semibold ${src ? 'bg-ink/75 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100' : 'text-muted'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden><path d="M4 16l4-4 4 4 4-6 4 6M4 4h16v16H4z" /></svg>
          {src ? 'Change photo' : 'Click or drop a photo here'}
        </span>
      </button>
      <input ref={input} type="file" name={name} accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} aria-label={label} onChange={(e) => pick(e.target.files)} />
      {error ? <p role="alert" className="mt-2 text-[12px] text-sale">{error}</p>
        : <p className="mt-2 text-[12px] text-muted">{preview ? 'New photo is saved when you press Save.' : 'JPG, PNG, WebP or GIF · up to 4 MB'}</p>}
    </div>
  );
}
