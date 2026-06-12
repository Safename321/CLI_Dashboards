import { HRISAdapter } from './interface.js';
import https from 'node:https';

function asArray(val) { return val == null ? [] : Array.isArray(val) ? val : [val]; }

export class AdpAdapter extends HRISAdapter {
  static id = 'adp';
  static name = 'ADP';

  constructor(credentials = {}) {
    super(credentials);
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.cert = credentials.cert;
    this.key = credentials.key;
    this.tokenUrl = credentials.tokenUrl || 'https://accounts.adp.com/auth/oauth/v2/token';
    this.apiUrl = credentials.apiUrl || 'https://api.adp.com';
    this._accessToken = null;
    this._tokenExpiry = 0;
  }

  _tlsAgent() { return new https.Agent({ cert: this.cert, key: this.key }); }

  async _getToken() {
    if (this._accessToken && Date.now() < this._tokenExpiry) return this._accessToken;
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}` },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
      dispatcher: this._tlsAgent(),
    });
    if (!res.ok) throw new Error(`ADP OAuth error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    this._accessToken = json.access_token;
    this._tokenExpiry = Date.now() + (json.expires_in || 3600) * 1000 - 60000;
    return this._accessToken;
  }

  async _api(path, { top = 100, skip = 0 } = {}) {
    const token = await this._getToken();
    const res = await fetch(`${this.apiUrl}${path}?$top=${top}&$skip=${skip}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      dispatcher: this._tlsAgent(),
    });
    if (!res.ok) throw new Error(`ADP API error ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }

  async _apiAll(path) {
    const all = [];
    let skip = 0;
    while (true) {
      const json = await this._api(path, { top: 100, skip });
      const items = json.workers || json.organizationDepartments || [];
      all.push(...items);
      if (items.length < 100) break;
      skip += 100;
    }
    return all;
  }

  async testConnection() {
    try { await this._api('/hr/v2/workers', { top: 1 }); return { ok: true }; }
    catch (err) { return { ok: false, error: err.message }; }
  }

  async fetchWorkers() {
    return (await this._apiAll('/hr/v2/workers')).map(w => {
      const person = w.person || {};
      const ln = person.legalName || {};
      const comm = person.communication || {};
      const assign = asArray(w.workAssignments)[0] || {};
      const emails = asArray(comm.emails);
      const workEmail = emails.find(e => e.nameCode?.codeValue === 'Work') || emails[0];
      return {
        externalId: w.associateOID,
        employeeId: w.workerID?.idValue || null,
        email: workEmail?.emailUri || null,
        legalName: `${ln.givenName || ''} ${ln.familyName1 || ''}`.trim() || 'Unknown',
        preferredName: person.preferredName ? `${person.preferredName.givenName || ''} ${person.preferredName.familyName1 || ''}`.trim() || null : null,
        positionTitle: assign.positionTitle || assign.jobTitle || null,
        positionExternalId: assign.positionID || null,
        organizationName: assign.homeOrganizationalUnit?.nameCode?.shortName || null,
        managerExternalId: assign.reportsTo?.[0]?.associateOID || null,
        status: this._mapStatus(w.workerStatus),
        hireDate: assign.hireDate || w.workerDates?.originalHireDate || null,
        terminationDate: assign.terminationDate || null,
      };
    });
  }

  async fetchOrganizations() {
    try {
      return (await this._apiAll('/core/v1/organization-departments')).map(o => ({
        externalId: o.departmentCode?.codeValue || o.organizationOID,
        name: o.departmentCode?.shortName || o.departmentCode?.longName || 'Unknown',
        parentExternalId: o.parentOrgCode?.codeValue || null,
        orgType: 'Department',
      }));
    } catch { return []; }
  }

  _mapStatus(status) {
    if (!status) return 'active';
    const c = status.statusCode?.codeValue?.toUpperCase();
    if (c === 'TERMINATED' || c === 'T') return 'terminated';
    if (c === 'INACTIVE' || c === 'I') return 'inactive';
    if (c === 'LEAVE' || c === 'L') return 'on_leave';
    return 'active';
  }
}
