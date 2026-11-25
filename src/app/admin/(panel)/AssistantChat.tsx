'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { askAssistant, confirmAssistantAction, type ChatMsg } from '../assistant-actions';
import type { PendingAction } from '@/lib/assistant';

type Line = ChatMsg & { kind?: 'error' | 'done' };
const STARTERS = ['Aaj ka summary do', 'Kaun se products kam stock mein hain?', 'Pending orders dikhao', 'Naya "Shipping Policy" page banao'];
const STORE = 'kk-assistant-chat';

/** Turns /admin/... paths in a reply into links. */
function Rich({ text }: { text: string }) {
  return <>{text.split(/(\/admin[\w/?=&-]*)/g).map((part, i) => (part.startsWith('/admin')
    ? <Link key={i} href={part} className="font-semibold text-gold-dark underline decoration-sand underline-offset-2">{part}</Link>
    : <span key={i}>{part.replace(/\*\*/g, '')}</span>))}</>;
}

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const s = sessionStorage.getItem(STORE); if (s) setLines(JSON.parse(s)); } catch { /* private mode: start empty */ } }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(lines.slice(-30))); } catch { /* ignore */ }
    end.current?.scrollIntoView({ block: 'end' });
  }, [lines, pending, busy, open]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: Line[] = [...lines, { role: 'user', content: t }];
    setLines(next); setInput(''); setPending(null); setBusy(true);
    const r = await askAssistant(next.filter((l) => !l.kind).map(({ role, content }) => ({ role, content })));
    setBusy(false);
    if (!r.ok) return setLines([...next, { role: 'assistant', content: r.error, kind: 'error' }]);
    setLines([...next, { role: 'assistant', content: r.reply }]);
    if (r.pending) setPending(r.pending);
  }

  async function confirm() {
    if (!pending || busy) return;
    setBusy(true);
    const r = await confirmAssistantAction(pending);
    setBusy(false); setPending(null);
    // Saved changes go into the history so the assistant knows they happened.
    setLines((l) => [...l, r.ok ? { role: 'assistant', content: `Done ✓ ${r.done}` } : { role: 'assistant', content: `Not saved: ${r.error}`, kind: 'error' }]);
  }

  return (
    <div className="print:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="kk-assistant"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_32px_-10px_rgba(53,34,24,.6)] ring-1 ring-sand/30 transition hover:bg-gold-dark">
        <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sand to-gold text-[13px] text-ink">✦</span>
        {open ? 'Close' : 'Ask assistant'}
      </button>

      {open && (
        <section id="kk-assistant" aria-label="Store assistant"
          className="fixed inset-x-3 bottom-20 top-20 z-40 flex flex-col overflow-hidden rounded-2xl border border-line bg-[#fffdf9] shadow-[0_24px_60px_-20px_rgba(53,34,24,.45)] sm:inset-x-auto sm:right-5 sm:top-auto sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px]">
          <header className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sand to-gold text-ink">✦</span>
            <div className="flex-1 leading-tight">
              <p className="font-display text-[17px]">Store assistant</p>
              <p className="text-[11px] text-sand/80">Runs the store and pages for you. Nothing changes until you confirm</p>
            </div>
            {lines.length > 0 && <button type="button" onClick={() => { setLines([]); setPending(null); }} className="rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-sand/80 hover:text-white">Clear</button>}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {lines.length === 0 && (
              <div className="space-y-3">
                <p className="text-[14px] text-body">Assalam o Alaikum! Main store chalane mein madad karta hoon: orders, products, categories, discounts, sale, pages, settings: sab kuch. Har change se pehle aap se Confirm lunga. Kuch bhi poochein.</p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-2 transition hover:border-gold hover:text-gold-dark">{s}</button>)}
                </div>
              </div>
            )}
            {lines.map((l, i) => (
              <div key={i} className={`flex ${l.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  l.role === 'user' ? 'rounded-br-md bg-ink text-white' : l.kind === 'error' ? 'rounded-bl-md bg-red-50 text-red-800' : 'rounded-bl-md bg-soft text-ink-2'}`}>
                  {l.role === 'user' ? l.content : <Rich text={l.content} />}
                </p>
              </div>
            ))}
            {pending && (
              <div className={`rounded-2xl border p-3.5 shadow-sm ${pending.danger ? 'border-red-300 bg-red-50' : 'border-sand bg-white'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${pending.danger ? 'text-red-700' : 'text-gold-dark'}`}>{pending.danger ? 'Careful: confirm this change' : 'Confirm change'}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-[14px] text-ink-2">{pending.summary}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={confirm} disabled={busy} className={`rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50 ${pending.danger ? 'bg-red-700 hover:bg-red-800' : 'bg-ink hover:bg-gold-dark'}`}>{pending.danger ? 'Yes, do it' : 'Confirm'}</button>
                  <button type="button" onClick={() => { setPending(null); setLines((l) => [...l, { role: 'assistant', content: 'Theek hai, kuch nahi badla.' }]); }} disabled={busy}
                    className="rounded-full border border-line px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-2 hover:border-gold">Cancel</button>
                </div>
              </div>
            )}
            {busy && <p className="text-[13px] text-muted">Soch raha hoon…</p>}
            <div ref={end} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-line bg-white p-3">
            <label htmlFor="kk-assistant-input" className="sr-only">Message</label>
            <textarea id="kk-assistant-input" value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={2000}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Poochein ya kahein, jaise: order KK… ko shipped kar do"
              className="field max-h-32 min-h-[44px] flex-1 resize-none border" />
            <button type="submit" disabled={busy || !input.trim()} className="h-11 rounded-full bg-ink px-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-gold-dark disabled:opacity-40">Send</button>
          </form>
        </section>
      )}
    </div>
  );
}
