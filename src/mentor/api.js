// AI Mentor chat transport. POSTs to the secure proxy (/api/chat) with the
// session JWT. The server validates auth, rate-limits, calls Anthropic, and
// returns { text, empty } — content-block filtering happens server-side, so
// the client never parses raw Anthropic payloads (and never sees an API key).

const FRIENDLY = {
  401: 'Session expired — please sign in again.',
  429: 'The mentor is getting a lot of questions right now — please wait a moment and try again.',
  badRequest: 'That message could not be sent — please try rephrasing it.',
  server: 'The mentor is unavailable right now — please try again in a moment.',
  network: 'Could not reach the mentor service — check your connection and try again.',
  empty: 'No response was generated. Please try rephrasing your question.',
};

/**
 * Send one mentor turn.
 * @param {object} opts
 * @param {string} opts.token            session JWT from useAuth()
 * @param {string} opts.system           full system prompt (base + active-mode suffix)
 * @param {Array}  opts.messages         clean chat history INCLUDING the new user message
 * @param {string} [opts.dashboardContext] structured data snapshot — prepended to the
 *                                         outgoing user message for THIS turn only, so
 *                                         the displayed/stored history stays clean
 * @returns {Promise<{text: string, empty: boolean}>}
 * @throws  Error whose .message is always user-facing (never a raw server string)
 */
export async function sendMentorMessage({ token, system, messages, dashboardContext }) {
  // Prepend the data snapshot to the final user message only (legacy behavior:
  // history sent to the model stays clean of duplicated context blocks).
  const outgoing = messages.map((m, i) =>
    i === messages.length - 1 && m.role === 'user' && dashboardContext
      ? { ...m, content: dashboardContext + m.content }
      : m,
  );

  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ system, messages: outgoing }),
    });
  } catch (err) {
    console.error('[mentor/api] network failure reaching /api/chat:', err);
    throw new Error(FRIENDLY.network);
  }

  if (!res.ok) {
    // Log the server detail for debugging; surface only a friendly message.
    let detail = null;
    try {
      detail = (await res.json())?.error;
    } catch (err) {
      console.error('[mentor/api] could not parse error body:', err);
    }
    console.error(`[mentor/api] /api/chat returned ${res.status}:`, detail);
    const msg =
      FRIENDLY[res.status] ||
      (res.status >= 500 ? FRIENDLY.server : FRIENDLY.badRequest);
    throw new Error(msg);
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    console.error('[mentor/api] could not parse success body:', err);
    throw new Error(FRIENDLY.server);
  }

  if (data.empty || !data.text) {
    return { text: FRIENDLY.empty, empty: true };
  }
  return { text: data.text, empty: false };
}
