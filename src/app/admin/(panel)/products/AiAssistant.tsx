'use client';
import { useRef, useState, useTransition } from 'react';
import { suggestProductCopy, type AiDraft } from '../../ai-actions';

const FIELDS = [['title', 'Title'], ['description', 'Description'], ['meta_title', 'Meta title'], ['meta_description', 'Meta description']] as const;

export default function AiAssistant({ enabled }: { enabled: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const form = () => box.current?.closest('form') ?? null;

  function run() {
    const f = form();
    if (!f) return;
    const data = new FormData();
    for (const k of ['id', 'title', 'code', 'description']) data.set(k, String(new FormData(f).get(k) ?? ''));
    const file = (f.elements.namedItem('image') as HTMLInputElement | null)?.files?.[0];
    if (file) data.set('image', file);
    data.set('notes', notes);
    setError(''); setDraft(null);
    start(async () => { const r = await suggestProductCopy(data); if (r.ok) setDraft(r.draft); else setError(r.error); });
  }
  function apply(k: (typeof FIELDS)[number][0]) {
    const el = form()?.elements.namedItem(k) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el && draft) { el.value = draft[k]; el.focus(); }
  }

  return (
    <div ref={box} className="mb-5 rounded bg-white p-4 shadow-card">
      <h2 className="mb-1 font-bold">Photo assistant</h2>
      {!enabled ? <p className="text-[13px] text-muted">Set <code>GROQ_API_KEY</code> in the server environment to draft titles and descriptions from the product photo.</p> : (
        <>
          <p className="mb-2 text-[12px] text-muted">Drafts copy from the chosen or saved photo using Groq. It will not invent fabric, size, stock or price; add confirmed facts below. Review each suggestion, apply it, then save.</p>
          <label htmlFor="ai-notes" className="label">Confirmed facts (optional)</label>
          <textarea id="ai-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} className="field" placeholder="e.g. Pure khaddar, 4.5 m unstitched, winter" />
          <button type="button" onClick={run} disabled={pending} className="mt-2 rounded bg-ink-2 px-4 py-1.5 text-white disabled:opacity-60">{pending ? 'Analysing photo…' : 'Draft from photo'}</button>
          {error && <p role="alert" className="mt-2 text-[13px] text-sale">{error}</p>}
          {draft && (
            <div className="mt-3 grid gap-3" aria-live="polite">
              {FIELDS.map(([k, label]) => draft[k] && (
                <div key={k} className="rounded border border-line p-2">
                  <div className="mb-1 flex items-center justify-between"><strong className="text-[12px]">{label}</strong>
                    <button type="button" onClick={() => apply(k)} className="rounded border border-line px-2 py-0.5 text-[12px] hover:border-gold">Apply</button></div>
                  <p className="whitespace-pre-line text-[13px]">{draft[k]}</p>
                </div>
              ))}
              {draft.questions.length > 0 && <div className="rounded bg-yellow-50 p-2 text-[13px]"><strong className="text-[12px]">Confirm before publishing</strong><ul className="ml-4 list-disc">{draft.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
