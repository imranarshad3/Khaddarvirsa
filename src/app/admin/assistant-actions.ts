'use server';
// Admin chat assistant. Tries Groq, then Gemini, then OpenRouter, so one provider hitting its limit does not stop it.
import { isAdmin } from '@/lib/auth';
import { hit } from '@/lib/rateLimit';
import { prepareWrite, runReadTool, runWrite, SYSTEM_PROMPT, TOOLS, WRITE_TOOLS, type PendingAction } from '@/lib/assistant';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };
type Reply = { ok: true; reply: string; pending?: PendingAction } | { ok: false; error: string };
type ToolCall = { id: string; function: { name: string; arguments: string } };
type ApiMsg = { role: string; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
type Provider = { name: string; url: string; key: string; model: string; extra?: Record<string, string> };

// All three speak the OpenAI chat format. Order = preference; a provider that hits its limit rests for a minute and the next one answers.
function providers(): Provider[] {
  const env = process.env;
  const all: (Provider | false | '' | undefined)[] = [
    env.GROQ_API_KEY && { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: env.GROQ_API_KEY, model: env.GROQ_CHAT_MODEL || env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b' },
    env.GEMINI_API_KEY && { name: 'Gemini', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', key: env.GEMINI_API_KEY, model: env.GEMINI_CHAT_MODEL || 'gemini-flash-latest' },
    env.OPENROUTER_API_KEY && { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: env.OPENROUTER_API_KEY, model: env.OPENROUTER_CHAT_MODEL || 'google/gemma-4-31b-it:free', extra: { 'X-Title': 'Khaddar Virsa admin' } },
  ];
  return all.filter((p): p is Provider => !!p);
}
const resting = new Map<string, number>(); // provider name -> time it can be tried again (per server instance)

/** One chat completion, trying each provider in turn until one answers. */
async function complete(messages: ApiMsg[]): Promise<{ ok: true; msg: ApiMsg } | { ok: false; error: string }> {
  const list = providers();
  if (!list.length) return { ok: false, error: 'Add GROQ_API_KEY, GEMINI_API_KEY or OPENROUTER_API_KEY to the server environment to enable the assistant.' };
  const ready = list.filter((p) => (resting.get(p.name) ?? 0) < Date.now());
  let limited = false;
  for (const p of ready.length ? ready : list) {
    try {
      const r = await fetch(p.url, {
        method: 'POST', signal: AbortSignal.timeout(40000),
        headers: { Authorization: `Bearer ${p.key}`, 'Content-Type': 'application/json', ...p.extra },
        body: JSON.stringify({ model: p.model, temperature: 0.3, max_tokens: 700, tools: TOOLS, tool_choice: 'auto', messages }),
      });
      if (r.ok) {
        const msg = ((await r.json()) as { choices?: { message?: ApiMsg }[] }).choices?.[0]?.message;
        if (msg) { resting.delete(p.name); return { ok: true, msg }; }
        console.error('assistant:', p.name, 'empty reply');
      } else {
        console.error('assistant:', p.name, r.status, (await r.text()).slice(0, 300));
        if (r.status === 429) limited = true;
      }
    } catch (e) {
      console.error('assistant:', p.name, e instanceof Error ? e.message : e);
    }
    resting.set(p.name, Date.now() + 60_000);
  }
  return { ok: false, error: limited ? 'All AI providers are busy or at their limit. Try again in a minute.' : 'The assistant could not answer. Please try again.' };
}

export async function askAssistant(history: ChatMsg[]): Promise<Reply> {
  if (!(await isAdmin())) return { ok: false, error: 'Please log in again.' };
  if ((await hit('admin-assistant', 3600)) > 80) return { ok: false, error: 'Assistant limit reached (80 messages per hour). Please try again later.' };

  const messages: ApiMsg[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-14)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))];
  if (messages.at(-1)?.role !== 'user') return { ok: false, error: 'Type a message first.' };

  try {
    for (let round = 0; round < 6; round++) {
      const res = await complete(messages);
      if (!res.ok) return res;
      const msg = res.msg;
      const calls = msg.tool_calls ?? [];
      const said = (msg.content ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (!calls.length) return { ok: true, reply: said || 'Sorry, I have no answer for that.' };

      messages.push({ role: 'assistant', content: msg.content ?? null, tool_calls: calls });
      for (const c of calls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(c.function.arguments || '{}'); } catch { /* bad JSON: tools see empty args and report what is missing */ }
        if (WRITE_TOOLS.has(c.function.name)) {
          const p = await prepareWrite(c.function.name, args);
          if (p.ok) return { ok: true, reply: said || 'Please check this change and press Confirm:', pending: p.action };
          messages.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify({ error: p.error }) });
        } else {
          messages.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(await runReadTool(c.function.name, args)).slice(0, 12000) });
        }
      }
    }
    return { ok: false, error: 'That took too many steps. Try asking in a simpler way.' };
  } catch {
    return { ok: false, error: 'Could not reach the assistant. Please try again.' };
  }
}

export async function confirmAssistantAction(action: PendingAction): Promise<{ ok: true; done: string } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: 'Please log in again.' };
  try {
    return { ok: true, done: await runWrite(action) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not save the change.' };
  }
}
