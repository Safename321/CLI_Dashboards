import { HRISAdapter } from './interface.js';

export class SapAdapter extends HRISAdapter {
  static id = 'sap';
  static name = 'SAP SuccessFactors';

  constructor(credentials = {}) {
    super(credentials);
    this.apiUrl = credentials.apiUrl?.replace(/\/+$/, '');
    this.companyId = credentials.companyId;
    this.username = credentials.username;
    this.password = credentials.password;
  }

  _authHeader() {
    return `Basic ${Buffer.from(`${this.username}@${this.companyId}:${this.password}`).toString('base64')}`;
  }

  async _odata(entity, { select, top = 1000, skip = 0 } = {}) {
    const params = new URLSearchParams({ $format: 'json', $top: String(top), $skip: String(skip) });
    if (select) params.set('$select', select);
    const res = await fetch(`${this.apiUrl}/odata/v2/${entity}?${params}`, {
      headers: { Authorization: this._authHeader(), Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`SAP OData error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    return json.d?.results || [];
  }

  async _odataAll(entity, opts = {}) {
    const all = [];
    let skip = 0;
    while (true) {
      const page = await this._odata(entity, { ...opts, top: 1000, skip });
      all.push(...page);
      if (page.length < 1000) break;
      skip += 1000;
    }
    return all;
  }

  async testConnection() {
    try { await this._odata('PerPersonal', { top: 1 }); return { ok: true }; }
    catch (err) { return { ok: false, error: err.message }; }
  }

  async fetchWorkers() {
    const [personal, emails, jobs] = await Promise.all([
      this._odataAll('PerPersonal', { select: 'personIdExternal,userId,firstName,lastName,preferredName' }),
      this._odataAll('PerEmail', { select: 'personIdExternal,emailAddress,emailType' }),
      this._odataAll('EmpJob', { select: 'userId,position,jobTitle,department,managerId,employmentStatus,startDate,endDate' }),
    ]);
    const emailMap = new Map();
    for (const e of emails) { if (!emailMap.has(e.personIdExternal) || e.emailType === 'B') emailMap.set(e.personIdExternal, e.emailAddress); }
    const jobMap = new Map();
    for (const j of jobs) { const ex = jobMap.get(j.userId); if (!ex || (j.startDate && j.startDate > (ex.startDate || ''))) jobMap.set(j.userId, j); }

    return personal.map(p => {
      const uid = p.userId || p.personIdExternal;
      const job = jobMap.get(uid) || {};
      return {
        externalId: uid, employeeId: p.personIdExternal || null, email: emailMap.get(p.personIdExternal) || null,
        legalName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown', preferredName: p.preferredName || null,
        positionTitle: job.jobTitle || null, positionExternalId: job.position || null, organizationName: job.department || null,
        managerExternalId: job.managerId || null, status: this._mapStatus(job.employmentStatus),
        hireDate: this._parseDate(job.startDate), terminationDate: this._parseDate(job.endDate),
      };
    });
  }

  async fetchOrganizations() {
    const [companies, departments] = await Promise.all([
      this._odataAll('FOCompany', { select: 'externalCode,name' }),
      this._odataAll('FODepartment', { select: 'externalCode,name,parent' }),
    ]);
    return [
      ...companies.map(c => ({ externalId: c.externalCode, name: c.name || c.externalCode, parentExternalId: null, orgType: 'Company' })),
      ...departments.map(d => ({ externalId: d.externalCode, name: d.name || d.externalCode, parentExternalId: d.parent || null, orgType: 'Department' })),
    ];
  }

  _mapStatus(s) {
    if (!s) return 'active';
    const u = String(s).toUpperCase();
    if (u === 'T' || u === 'TERMINATED') return 'terminated';
    if (u === 'U' || u === 'INACTIVE') return 'inactive';
    if (u === 'P' || u === 'SUSPENDED') return 'on_leave';
    return 'active';
  }

  _parseDate(d) {
    if (!d) return null;
    const m = d.match(/\/Date\((\d+)\)\//);
    if (m) return new Date(parseInt(m[1], 10)).toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
    return null;
  }
}
