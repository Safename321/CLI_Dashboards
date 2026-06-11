// Question bank lookup for the "Create Report" flow (v1.24L App.jsx 806–885).
import { REPORT_QUESTION_BANK, DEFAULT_REPORT_QUESTIONS } from '../data/datasets/report-questions.js';

// Returns [{question, choices}] for a tactic. Bank entries are checked in
// order against the lowercased "<title> <deliverable>" key — first match wins,
// preserving the legacy if/else cascade semantics.
export function getReportQuestions(tacticTitle, deliverable) {
  const key = `${tacticTitle || ''} ${deliverable || ''}`.toLowerCase();
  const entry = REPORT_QUESTION_BANK.find((e) => e.keywords.some((k) => key.includes(k)));
  return entry ? entry.questions : DEFAULT_REPORT_QUESTIONS;
}
