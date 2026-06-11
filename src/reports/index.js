// Public surface of the report-generation subsystem. Other modules import
// these names from '../reports/index.js' — do not rename.
export { generateReport } from './advisory.js';
export { getReportQuestions } from './questions.js';
export { REPORT_BUTTON_SAYINGS } from '../data/datasets/report-questions.js';
export { generateBoardPacketPDF, generateInvestorPDF } from './packets.js';
export { generateOASIExplainerReport } from './oasiExplainer.js';
