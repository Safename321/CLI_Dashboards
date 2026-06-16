// AI Mentor chat transport — POSTs to the Laravel chat proxy (/api/chat) via dashFetch,
// which attaches the session JWT (+ impersonation header) and refreshes on 401. The server
// validates auth, rate-limits, calls Anthropic, and returns { text, empty } — content-block
// filtering is server-side, so the client never parses raw Anthropic payloads or sees a key.
//
// If the chat controller isn't deployed yet (404/501), the mentor degrades to a friendly
// "not available" message instead of erroring — so the rest of the dashboard is unaffected.
import { dashFetch } from '../lib/auth.js';

const FRIENDLY = {
  401: 'Session expired — please sign in again.',
  404: 'The AI mentor is not enabled on this server yet.',
  501: 'The AI mentor is not enabled on this server yet.',
  429: 'The mentor is getting a lot of questions right now — please wait a moment and try again.',
  badRequest: 'That message could not be sent — please try rephrasing it.',
  server: 'The mentor is unavailable right now — please try again in a moment.',
  network: 'Could not reach the mentor service — check your connection and try again.',
  empty: 'No response was generated. Please try rephrasing your question.',
};

/**
 * Send one mentor turn.
 * @param {object} opts
 * @param {string} opts.system            full system prompt (base + active-mode suffix)
 * @param {Array}  opts.messages          chat history INCLUDING the new user message
 * @param {string} [opts.dashboardContext] data snapshot prepended to the final user message only
 * @returns {Promise<{text: string, empty: boolean}>}
 * @throws  Error whose .message is always user-facing (never a raw server string)
 */
export async function sendMentorMessage({ system, messages, dashboardContext }) {
  const outgoing = messages.map((m, i) =>
    i === messages.length - 1 && m.role === 'user' && dashboardContext
      ? { ...m, content: dashboardContext + m.content }
      : m,
  );

  let res;
  try {
    res = await dashFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ system, messages: outgoing }),
    });
  } catch (err) {
    console.error('[mentor/api] network failure reaching /chat:', err);
    throw new Error(FRIENDLY.network);
  }

  if (!res.ok) {
    let detail = null;
    try { detail = (await res.json())?.error; } catch { /* ignore */ }
    console.error(`[mentor/api] /chat returned ${res.status}:`, detail);
    const msg = FRIENDLY[res.status] || (res.status >= 500 ? FRIENDLY.server : FRIENDLY.badRequest);
    throw new Error(msg);
  }

  let data;
  try { data = await res.json(); }
  catch (err) { console.error('[mentor/api] bad success body:', err); throw new Error(FRIENDLY.server); }

  if (data.empty || !data.text) return { text: FRIENDLY.empty, empty: true };
  return { text: data.text, empty: false };
}
