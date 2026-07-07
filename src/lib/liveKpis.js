// liveKpis.js — build FinancialKPICard props from the per-tenant `currentKpis`
// dataset ({ cashMultiple, cacPayback, churnRate, salesCycle, leadConversion }).
// Thresholds and trigger strings mirror the static FINANCIAL_KPI_CARDS demo set
// (data/datasets/executive.js) so live and demo read identically.

export function financialCardsFromKpis(k) {
  if (!k || typeof k !== 'object') return null;
  const cards = [];

  if (k.cashMultiple != null) {
    const bad = k.cashMultiple < 1.0;
    cards.push({
      label: 'Cash Multiple', value: k.cashMultiple, unit: 'x',
      threshold: '1.0', thresholdDir: '>',
      status: bad ? 'danger' : k.cashMultiple < 1.2 ? 'warning' : 'good',
      trigger: bad ? 'Cut Costs + Annual Billing' : null,
      boardAction: bad ? '↓ Cut Costs' : '✓ On Track',
    });
  }
  if (k.cacPayback != null) {
    const bad = k.cacPayback > 12;
    cards.push({
      label: 'CAC Payback', value: k.cacPayback, unit: ' mo',
      threshold: '12', thresholdDir: '<',
      status: k.cacPayback > 18 ? 'danger' : bad ? 'warning' : 'good',
      trigger: bad ? 'Cut Costs + Pause Hiring' : null,
      boardAction: bad ? '↓ Pause Hiring' : '✓ On Track',
    });
  }
  if (k.churnRate != null) {
    const bad = k.churnRate > 3;
    cards.push({
      label: 'Churn Rate', value: k.churnRate, unit: '%',
      threshold: '3', thresholdDir: '<',
      status: bad ? 'danger' : 'good',
      trigger: bad ? 'All 3 Strategies' : null,
      boardAction: bad ? '↓ Annual Billing' : '✓ On Track',
    });
  }
  if (k.salesCycle != null) {
    const bad = k.salesCycle > 90;
    cards.push({
      label: 'Sales Cycle', value: k.salesCycle, unit: ' days',
      threshold: '90', thresholdDir: '<',
      status: bad ? 'warning' : 'good',
      trigger: bad ? 'Evaluate Funnel' : null,
      boardAction: bad ? '↓ Shorten Cycle' : '✓ On Track',
    });
  }
  if (k.leadConversion != null) {
    const bad = k.leadConversion < 5;
    cards.push({
      label: 'Lead Conversion', value: k.leadConversion, unit: '%',
      threshold: '5', thresholdDir: '>',
      status: bad ? 'danger' : 'good',
      trigger: bad ? 'Cut Costs + Pause Hiring' : null,
      boardAction: bad ? '↓ Cut Channels' : '✓ On Track',
    });
  }

  return cards.length ? cards : null;
}
