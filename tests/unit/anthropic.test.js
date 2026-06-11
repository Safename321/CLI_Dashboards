import { describe, it, expect, vi, afterEach } from 'vitest';
import { forwardToAnthropic } from '../../cli-proxy-server/lib/anthropic.js';

function mockFetch(status, body) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }));
}

const ARGS = { apiKey: 'k', messages: [{ role: 'user', content: 'hi' }] };

afterEach(() => vi.unstubAllGlobals());

describe('forwardToAnthropic response handling (§5)', () => {
  it('joins multiple text blocks and ignores non-text blocks', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(200, {
        content: [
          { type: 'thinking', thinking: 'internal' },
          { type: 'text', text: 'First part.' },
          { type: 'tool_use', name: 'x', input: {} },
          { type: 'text', text: 'Second part.' },
        ],
      })
    );
    const r = await forwardToAnthropic(ARGS);
    expect(r.ok).toBe(true);
    expect(r.text).toBe('First part.\nSecond part.');
    expect(r.empty).toBeUndefined();
  });

  it('never assumes content[0].text — tolerates leading non-text block', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { content: [{ type: 'tool_use' }, { type: 'text', text: 'Answer' }] }));
    const r = await forwardToAnthropic(ARGS);
    expect(r.text).toBe('Answer');
  });

  it('returns a user-facing message for empty responses', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { content: [] }));
    const r = await forwardToAnthropic(ARGS);
    expect(r.ok).toBe(true);
    expect(r.empty).toBe(true);
    expect(r.text).toMatch(/No response was generated/);
  });

  it('surfaces API errors with status and message', async () => {
    vi.stubGlobal('fetch', mockFetch(429, { error: { message: 'rate limited' } }));
    const r = await forwardToAnthropic(ARGS);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(429);
    expect(r.error).toBe('rate limited');
  });

  it('handles malformed (non-JSON) error bodies', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 502, json: async () => { throw new Error('bad json'); } })));
    const r = await forwardToAnthropic(ARGS);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Anthropic error 502/);
  });
});
