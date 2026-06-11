// Anthropic Messages API forwarder for the AI mentor. Filters response content
// blocks by type and joins text blocks (§5) — never assumes content[0].text.
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export async function forwardToAnthropic({ apiKey, model, system, messages, maxTokens }) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: maxTokens || 1024,
      system,
      messages,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Anthropic error ${res.status}`;
    return { ok: false, status: res.status, error: msg };
  }

  // §5: join all text-type content blocks; tolerate empty/tool responses.
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n')
    .trim();

  if (!text) {
    return { ok: true, status: 200, text: 'No response was generated. Please try rephrasing your question.', empty: true, raw: data };
  }
  return { ok: true, status: 200, text, raw: data };
}
