'use server';
// Admin chat assistant on Groq (same provider and key as the photo assistant).
import { isAdmin } from '@/lib/auth';
import { hit } from '@/lib/rateLimit';
import { prepareWrite, runReadTool, runWrite, SYSTEM_PROMPT, TOOLS, WRITE_TOOLS, type PendingAction } from '@/lib/assistant';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };
type Reply = { ok: true; reply: string; pending?: PendingAction } | { ok: false; error: string };
type ToolCall = { id: string; function: { name: string; arguments: string } };
type ApiMsg = { role: string; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };

export async function askAssistant(history: ChatMsg[]): Promise<Reply> {
  if (!(await isAdmin())) return { ok: false, error: 'Please log in again.' };
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, error: 'Add GROQ_API_KEY to the server environment to enable the assistant.' };
  if ((await hit('admin-assistant', 3600)) > 80) return { ok: false, error: 'Assistant limit reached (80 messages per hour). Please try again later.' };

  const messages: ApiMsg[] = [{ role: 'system', content: SYSTEM_PROMPT }, ...history.slice(-14)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))];
  if (messages.at(-1)?.role !== 'user') return { ok: false, error: 'Type a message first.' };

  try {
    for (let round = 0; round < 6; round++) {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST', signal: AbortSignal.timeout(45000),
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.GROQ_CHAT_MODEL || process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b', temperature: 0.3, max_completion_tokens: 700, tools: TOOLS, tool_choice: 'auto', messages }),
      });
      if (!r.ok) {
        console.error('assistant: groq', r.status, (await r.text()).slice(0, 300));
        if (r.status === 429) return { ok: false, error: 'Groq is busy or its usage limit was reached. Try again in a minute.' };
        if (r.status === 401 || r.status === 403) return { ok: false, error: 'The Groq key or model access needs attention in the server environment.' };
        return { ok: false, error: 'The assistant could not answer. Please try again.' };
      }
      const msg = ((await r.json()) as { choices?: { message?: ApiMsg }[] }).choices?.[0]?.message;
      if (!msg) return { ok: false, error: 'The assistant returned nothing. Please try again.' };
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
