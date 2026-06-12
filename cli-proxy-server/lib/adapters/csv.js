import { HRISAdapter } from './interface.js';
import { parseWorkersCsv } from '../workersCsv.js';

export class CsvAdapter extends HRISAdapter {
  static id = 'csv';
  static name = 'CSV Upload';

  constructor(credentials = {}) {
    super(credentials);
  }

  async testConnection() {
    return { ok: true };
  }

  async fetchWorkers() {
    const { ok, workers, errors } = parseWorkersCsv(this.credentials.csvText);
    if (!ok) throw new Error(`CSV parse failed: ${errors.map(e => e.error).join('; ')}`);
    return workers.map(w => ({
      externalId: w.workdayId,
      employeeId: w.employeeId || null,
      email: w.email || null,
      legalName: w.legalName,
      preferredName: w.preferredName || null,
      positionTitle: w.positionTitle || null,
      positionExternalId: w.positionWorkdayId || null,
      organizationName: w.organization || null,
      managerExternalId: w.managerWorkdayId || null,
      status: w.status || 'active',
      hireDate: w.hireDate || null,
      terminationDate: w.terminationDate || null,
    }));
  }
}
