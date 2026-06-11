// Sentiment Analysis dashboard datasets (ported from v1.24L App.jsx §SentimentDashboard).

// External public-signal sources used to calibrate the internal OASI diagnostic.
export const EXTERNAL_SOURCES = [
  {
    name: 'Glassdoor', icon: '⭐', metric: '3.7 / 5.0', delta: '−0.2 (30d)', deltaTone: 'down',
    detail: '1,284 reviews · "no growth path" up 4× vs. baseline',
    confirms: 'Vicarious 3.11 (succession gap)',
  },
  {
    name: 'Layoffs.fyi', icon: '📉', metric: 'No layoffs', delta: 'Peer set: 3 events Q1', deltaTone: 'watch',
    detail: "Moody's −180, MSCI −95, FactSet −60 (last 90 days)",
    confirms: 'Peer pressure on Ratings franchise',
  },
  {
    name: 'LinkedIn', icon: '💼', metric: '38,200 emp.', delta: '+0.9% (90d)', deltaTone: 'up',
    detail: '"Open to work" rate 4.1% (peer median 3.6%)',
    confirms: 'Flight risk signal — Relational gap',
  },
];

// Department-level sentiment heat map.
export const DEPARTMENT_SENTIMENT = [
  { dept: 'Engineering', happy: 7.2, flight: 4, issues: 12, trend: 'stable' },
  { dept: 'Sales', happy: 6.8, flight: 6, issues: 18, trend: 'watch' },
  { dept: 'Operations', happy: 4.9, flight: 18, issues: 47, trend: 'crisis' },
  { dept: 'Marketing', happy: 7.5, flight: 2, issues: 8, trend: 'improving' },
  { dept: 'Finance', happy: 6.4, flight: 5, issues: 14, trend: 'declining' },
];

// Reported-difficulty bars: KPI key + static report counts.
export const DIFFICULTY_ITEMS = [
  { key: 'teamDifficulties', label: 'Team Difficulties', count: 118 },
  { key: 'missingResources', label: 'Missing Resources', count: 98 },
  { key: 'productQuality', label: 'Product Quality', count: 62 },
  { key: 'teamCooperation', label: 'Team Cooperation', count: 51 },
];

// Fallback KPI values (legacy DEFAULT_YEAR_DATA subset) used when a field is
// missing from yearData / yearlyKPIs.
export const SENTIMENT_KPI_DEFAULTS = {
  jobHappiness: 7, teamHappiness: 7.2, companyHappiness: 6.5, lifeHappiness: 7,
  improveWork: 60, improveTeam: 25, realignment: 10, flightRisk: 5, withholding: 1.2,
  customerProduct: 7, customerTeam: 7, customerCompany: 6.5, customerCompetitor: 4.5, customerRelationship: 7,
  teamDifficulties: 25, missingResources: 22, productQuality: 14, teamCooperation: 12,
};
