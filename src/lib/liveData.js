// liveData.js — tenant-scoped data hooks for the v2 dashboard against Laravel.
// Ported/adapted from v1.24d. The cache is namespaced by the effective tenant so a
// SuperAdmin impersonating company A can never be served company B's cached data.
import { useEffect, useState } from 'react';
import { dashFetch, getEffectiveTenantKey } from './auth.js';

const _cache = new Map(); // `${tenant}:${key}` -> payload

// useDataset — tenant-scoped fetch of one named dashboard dataset, with a static fallback.
//   const merger = useDataset('mergerFeedback', MERGER_FEEDBACK_DATA);
export function useDataset(key, fallback = null) {
  const tenant = getEffectiveTenantKey();
  const cacheKey = `${tenant}:${key}`;
  const [data, setData] = useState(_cache.get(cacheKey) ?? fallback);

  useEffect(() => {
    let cancelled = false;
    if (_cache.has(cacheKey)) { setData(_cache.get(cacheKey)); return; }
    dashFetch(`/dashboard/dataset/${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const payload = json?.data ?? json?.payload ?? fallback;
        _cache.set(cacheKey, payload);
        setData(payload);
      })
      .catch(() => { if (!cancelled) setData(fallback); });
    return () => { cancelled = true; };
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

// useTenantBundle — assemble the whole dataset object for the current tenant from Laravel
// (GET /dashboard/dataset-bundle → { key: payload, ... }). `fallback` is the static demo
// bundle (spgi-data.json) used only for the public/demo build. Returns { data, status }.
export function useTenantBundle({ fallback = null, useFallback = false } = {}) {
  const tenant = getEffectiveTenantKey();
  const [state, setState] = useState({ data: useFallback ? fallback : null, status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    if (useFallback) { setState({ data: fallback, status: 'ready' }); return; }
    setState((s) => ({ ...s, status: 'loading' }));
    dashFetch('/dashboard/dataset-bundle')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const bundle = json?.data ?? json ?? null;
        const empty = !bundle || Object.keys(bundle).length === 0;
        setState({ data: empty ? null : bundle, status: 'ready' });
      })
      .catch(() => { if (!cancelled) setState({ data: null, status: 'error' }); });
    return () => { cancelled = true; };
  }, [tenant, useFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

// useLive — tenant-scoped fetch of a COMPUTED/live endpoint (not a stored dataset), with a
// transform + static fallback. Used by the four rich panels that have dedicated endpoints.
//   const oasi = useLive('orgOasi', '/dashboard/org-oasi', (j) => j.data, ORG_OASI_FALLBACK);
export function useLive(key, path, transform = (x) => x, fallback = null) {
  const tenant = getEffectiveTenantKey();
  const cacheKey = `${tenant}:live:${key}`;
  const [data, setData] = useState(_cache.get(cacheKey) ?? fallback);

  useEffect(() => {
    let cancelled = false;
    if (_cache.has(cacheKey)) { setData(_cache.get(cacheKey)); return; }
    dashFetch(path)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const out = json ? transform(json) : fallback;
        _cache.set(cacheKey, out);
        setData(out);
      })
      .catch(() => { if (!cancelled) setData(fallback); });
    return () => { cancelled = true; };
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

// Convenience wrappers for the dedicated live endpoints.
export const useRoster   = (fallback = []) => useLive('roster',   '/dashboard/roster',         (j) => j.employees ?? j.data ?? [], fallback);
export const useOrgOasi  = (fallback = null) => useLive('orgOasi', '/dashboard/org-oasi',        (j) => j.data ?? j, fallback);
export const useFillJobs = (fallback = null) => useLive('fillJobs','/dashboard/fill-jobs-data',  (j) => j.data ?? j, fallback);

// useLiveBundle — status-aware tenant fetch returning { data, status } so views can
// distinguish loading / error / genuinely-empty and show proper guidance instead of
// silently falling back to demo data. status: 'loading' | 'ready' | 'error' | 'disabled'.
// Pass enabled=false (demo build) to skip the network call entirely.
function useLiveBundle(key, path, enabled = true) {
  const tenant = getEffectiveTenantKey();
  const cacheKey = `${tenant}:live:${key}`;
  const [state, setState] = useState(() =>
    (enabled ? (_cache.get(cacheKey) ?? { data: null, status: 'loading' }) : { data: null, status: 'disabled' }));

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const cached = _cache.get(cacheKey);
    if (cached) { setState(cached); return; }
    dashFetch(path)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (cancelled) return;
        const next = { data: json?.data ?? json ?? null, status: 'ready' };
        _cache.set(cacheKey, next);
        setState(next);
      })
      .catch(() => { if (!cancelled) setState({ data: null, status: 'error' }); });
    return () => { cancelled = true; };
  }, [cacheKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

export const useFillJobsBundle = (enabled = true) => useLiveBundle('fillJobsBundle', '/dashboard/fill-jobs-data', enabled);
export const useOrgOasiBundle  = (enabled = true) => useLiveBundle('orgOasiBundle',  '/dashboard/org-oasi',       enabled);

// assignInstruments — POST /assignments (Individual-ASI "assign"). Returns the created batch.
export async function assignInstruments(payload) {
  const res = await dashFetch('/assignments', { method: 'POST', body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Assignment failed (${res.status})`);
  return body;
}

// assignmentStatus — GET /assignments/{batchId}/status.
export async function assignmentStatus(batchId) {
  const res = await dashFetch(`/assignments/${encodeURIComponent(batchId)}/status`);
  return res.ok ? res.json() : null;
}

export function clearDatasetCache() { _cache.clear(); }
