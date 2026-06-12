import { CsvAdapter } from './csv.js';
import { WorkdayAdapter } from './workday.js';
import { SapAdapter } from './sap.js';
import { AdpAdapter } from './adp.js';

export const adapters = { csv: CsvAdapter, workday: WorkdayAdapter, sap: SapAdapter, adp: AdpAdapter };

export function getAdapter(providerId, credentials) {
  const Adapter = adapters[providerId];
  if (!Adapter) throw new Error(`Unknown HRIS provider: ${providerId}`);
  return new Adapter(credentials);
}

export { CsvAdapter, WorkdayAdapter, SapAdapter, AdpAdapter };
