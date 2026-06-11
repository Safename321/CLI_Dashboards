// Small fetch helpers for upstream data APIs: JSON + text with timeout.
export async function fetchJson(url, opts = {}, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export async function fetchText(url, opts = {}, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`upstream ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}
