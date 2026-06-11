// Builds the structured dashboard snapshot prepended to each outgoing mentor
// message, plus the in-panel alert list. Ported from legacy buildDataContext /
// getCurrentAlerts; numbers now come from the tenant dataset (yearlyKPIs +
// financials) instead of app-level mock state.
import { DASHBOARD_LABELS } from '../data/datasets/mentor-content.js';

const fmt = (v, unit = '') => (v === null || v === undefined ? 'n/a' : `${v}${unit}`);

// Early-warning trigger count: same five thresholds the context block states
// (churn>4%, sentiment<7, psych safety<7, flight risk>5, NPS<40). The legacy
// app received this pre-computed; the rewrite derives it from the KPIs.
export function countEarlyWarnings(kpis = {}) {
  let n = 0;
  if (kpis.churnRate > 4.0) n += 1;
  if (kpis.jobHappiness < 7.0) n += 1;
  if (kpis.psychSafety < 7.0) n += 1;
  if (kpis.flightRisk > 5.0) n += 1;
  if (kpis.nps < 40) n += 1;
  return n;
}

export function buildDashboardContext({ currentDashboard, selectedYear, yearData, kpis = {} }) {
  const styles = kpis.achievingStyles || {};
  const dashLabel = DASHBOARD_LABELS[currentDashboard] || currentDashboard || 'unknown';
  const triggered = countEarlyWarnings(kpis);

  return `--- CURRENT DASHBOARD CONTEXT ---
Viewing: ${dashLabel} dashboard · Year: ${selectedYear ?? 'n/a'}

Active alerts:
  • Early-warning KPIs triggered: ${triggered} of 5
  • Customer churn: ${fmt(kpis.churnRate, '%')} (threshold: 4%)
  • Employee sentiment (jobHappiness): ${fmt(kpis.jobHappiness, '/10')} (target: 7+)
  • Psychological safety: ${fmt(kpis.psychSafety, '/10')} (target: 7+)
  • Flight risk: ${fmt(kpis.flightRisk, '/10')}
  • NPS: ${fmt(kpis.nps)} (target: 40+)

Financials (${selectedYear ?? ''}):
  • Revenue: $${fmt(yearData?.revenue)}M, growth ${fmt(yearData?.revenueGrowth, '%')}
  • Net income: $${fmt(yearData?.netIncome)}M · EPS: $${fmt(yearData?.eps)}
  • Operating margin: ${fmt(yearData?.operatingMargin, '%')} · Net margin: ${fmt(yearData?.netMargin, '%')}
  • ROE: ${fmt(yearData?.roe, '%')} · Churn: ${fmt(kpis.churnRate, '%')}

OASI Achieving Styles (organizational reward profile, 0-10):
  Direct set:       Intrinsic ${fmt(styles.intrinsic)} · Competitive ${fmt(styles.competitive)} · Power ${fmt(styles.power)}
  Relational set:   Collaborative ${fmt(styles.collaborative)} · Contributory ${fmt(styles.contributory)} · Vicarious ${fmt(styles.vicarious)}
  Instrumental set: Personal ${fmt(styles.personal)} · Social ${fmt(styles.social)} · Entrusting ${fmt(styles.entrusting)}

Customer & culture signals:
  • Customer satisfaction (CSAT): ${fmt(kpis.csat, '/10')} · CES: ${fmt(kpis.ces, '/10')}
  • Discretionary effort: ${fmt(kpis.discretionaryEffort, '%')}
  • Team happiness: ${fmt(kpis.teamHappiness, '/10')} · Company happiness: ${fmt(kpis.companyHappiness, '/10')}
  • Turnover: ${fmt(kpis.turnover, '%')} · Growth mindset: ${fmt(kpis.growthMindset, '%')}

Use these numbers when relevant. If the user references a metric not listed, say so rather than guessing.
--- USER QUESTION ---
`;
}

// In-panel alert chips. Legacy also flagged an "active PR crisis" from mock
// app state; the tenant dataset has no such signal, so that alert is omitted.
export function getMentorAlerts(kpis = {}) {
  const alerts = [];
  const triggered = countEarlyWarnings(kpis);

  if (triggered >= 4) {
    alerts.push({
      id: 'early-warning-critical',
      severity: 'critical',
      dashboard: 'early-warning',
      title: '🚨 Multiple Early Warning Triggers',
      description: `${triggered} of 5 financial health indicators triggered`,
      action: 'Early Warning KPIs',
      priority: 1,
    });
  }

  if (kpis.churnRate > 4.0) {
    alerts.push({
      id: 'churn-high',
      severity: 'warning',
      dashboard: 'customer-health',
      title: '⚠️ Customer Churn Elevated',
      description: `Churn rate at ${kpis.churnRate}% (threshold: 4%)`,
      action: 'Customer Health',
      priority: 2,
    });
  }

  if (kpis.jobHappiness < 7.0) {
    alerts.push({
      id: 'sentiment-low',
      severity: 'warning',
      dashboard: 'sentiment',
      title: '⚠️ Employee Sentiment Declining',
      description: `Average sentiment at ${kpis.jobHappiness}/10 (target: 7+)`,
      action: 'Sentiment Analysis',
      priority: 2,
    });
  }

  return alerts;
}
