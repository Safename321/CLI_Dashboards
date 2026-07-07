// useSwotData — one hook for the SWOT factor set, shared by the standalone
// dashboard and the CEO Advisory embed. Demo build: the §6.1 reference
// profile. Real tenant: factors computed live from /dashboard/org-oasi through
// the per-tenant `swotConfig` dataset (§7 — configurable per profile), with
// CLI defaults when nothing is stored.
import { useMemo } from 'react';
import { buildSwotFactors } from './logic.js';
import {
  REFERENCE_FACTORS, REFERENCE_ARROWS, REFERENCE_META, REFERENCE_RECOMMENDATIONS,
  DEFAULT_SWOT_CONFIG,
} from '../../data/datasets/swot.js';
import { useOrgOasiBundle, useDataset } from '../../lib/liveData.js';
import { getUser } from '../../lib/auth.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

export const STYLE_KEYS = {
  intrinsic: 'Intrinsic', competitive: 'Competitive', power: 'Power',
  personal: 'Personal', social: 'Social', entrusting: 'Entrusting',
  collaborative: 'Collaborative', contributory: 'Contributory', vicarious: 'Vicarious',
};

// Stored tenant config may be partial — merge over the CLI defaults.
export function mergeSwotConfig(stored) {
  if (!stored || typeof stored !== 'object' || !Object.keys(stored).length) return DEFAULT_SWOT_CONFIG;
  return {
    styles: { ...DEFAULT_SWOT_CONFIG.styles, ...(stored.styles || {}) },
    inferred: stored.inferred ?? DEFAULT_SWOT_CONFIG.inferred,
    arrows: stored.arrows ?? DEFAULT_SWOT_CONFIG.arrows,
    recommendations: stored.recommendations ?? [],
  };
}

export default function useSwotData() {
  const live = useOrgOasiBundle(!DEMO_BUILD);
  // Demo build: the fetch 401s harmlessly and falls back to null (hooks must
  // run unconditionally); live: stored per-tenant config or null → defaults.
  const storedConfig = useDataset('swotConfig', null);

  return useMemo(() => {
    if (DEMO_BUILD) {
      return {
        status: 'ready', isLive: false,
        factors: REFERENCE_FACTORS, arrows: REFERENCE_ARROWS,
        recommendations: REFERENCE_RECOMMENDATIONS, meta: REFERENCE_META,
      };
    }
    if (live.status === 'loading') return { status: 'loading' };
    if (live.status === 'error') return { status: 'error' };

    const scores = live.data?.scores;
    const recordCount = live.data?.recordCount ?? 0;
    if (!scores || !recordCount) return { status: 'empty' };

    const config = mergeSwotConfig(storedConfig);
    const named = {};
    for (const [k, name] of Object.entries(STYLE_KEYS)) {
      if (scores[k] != null) named[name] = Number(scores[k]);
    }
    const factors = buildSwotFactors(named, config);
    // Arrows only where both ends materialized.
    const ids = new Set(factors.map((f) => f.id));
    const arrows = (config.arrows || []).filter((a) => ids.has(a.from) && ids.has(a.to));

    return {
      status: 'ready', isLive: true, factors, arrows,
      recommendations: config.recommendations?.length ? config.recommendations : REFERENCE_RECOMMENDATIONS,
      meta: {
        title: 'Strategic SWOT',
        subtitle: `${getUser()?.company?.name ?? getUser()?.company ?? 'Your organization'} · live org profile (n=${recordCount})`,
        respondents: recordCount,
        instrument: 'OASI',
      },
    };
  }, [live, storedConfig]);
}
