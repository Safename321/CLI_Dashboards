import { HRISAdapter } from './interface.js';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

function soapEnvelope(body, { username, password }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
              xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <env:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password>${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </env:Header>
  <env:Body>${body}</env:Body>
</env:Envelope>`;
}

function dig(obj, ...path) {
  let cur = obj;
  for (const p of path) { if (cur == null) return null; cur = cur[p]; }
  return cur ?? null;
}

function asArray(val) { return val == null ? [] : Array.isArray(val) ? val : [val]; }

function extractText(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined) return typeof obj[k] === 'object' ? obj[k]['#text'] || '' : String(obj[k]);
  }
  return null;
}

export class WorkdayAdapter extends HRISAdapter {
  static id = 'workday';
  static name = 'Workday';

  constructor(credentials = {}) {
    super(credentials);
    this.tenantUrl = credentials.tenantUrl?.replace(/\/+$/, '');
    this.username = credentials.username;
    this.password = credentials.password;
  }

  async _soap(service, body) {
    const url = `${this.tenantUrl}/ccx/service/${service}`;
    const envelope = soapEnvelope(body, { username: this.username, password: this.password });
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/xml; charset=utf-8' }, body: envelope });
    const text = await res.text();
    if (!res.ok) {
      const parsed = parser.parse(text);
      const fault = dig(parsed, 'Envelope', 'Body', 'Fault', 'faultstring') || `HTTP ${res.status}`;
      throw new Error(`Workday SOAP error: ${fault}`);
    }
    return parser.parse(text);
  }

  async testConnection() {
    try {
      await this._soap('Human_Resources/v42.0', '<Get_Workers_Request xmlns="urn:com.workday/bsvc" version="v42.0"><Response_Filter><Page>1</Page><Count>1</Count></Response_Filter></Get_Workers_Request>');
      return { ok: true };
    } catch (err) { return { ok: false, error: err.message }; }
  }

  async fetchWorkers() {
    const all = [];
    let page = 1, totalPages = 1;
    while (page <= totalPages) {
      const body = `<Get_Workers_Request xmlns="urn:com.workday/bsvc" version="v42.0"><Response_Filter><Page>${page}</Page><Count>200</Count></Response_Filter><Response_Group><Include_Personal_Information>true</Include_Personal_Information><Include_Employment_Information>true</Include_Employment_Information><Include_Organizations>true</Include_Organizations></Response_Group></Get_Workers_Request>`;
      const xml = await this._soap('Human_Resources/v42.0', body);
      const resp = dig(xml, 'Envelope', 'Body', 'Get_Workers_Response');
      if (!resp) throw new Error('Unexpected Workday response shape');
      const results = dig(resp, 'Response_Results');
      if (results) totalPages = parseInt(results.Total_Pages, 10) || 1;
      for (const w of asArray(dig(resp, 'Response_Data', 'Worker'))) all.push(this._mapWorker(w));
      page++;
    }
    return all;
  }

  _mapWorker(w) {
    const personal = dig(w, 'Worker_Data', 'Personal_Data');
    const employment = dig(w, 'Worker_Data', 'Employment_Data');
    const nameData = dig(personal, 'Name_Data', 'Legal_Name_Data', 'Name_Detail_Data');
    const position = dig(employment, 'Position_Data');
    const statusData = dig(employment, 'Worker_Status_Data');
    const emails = asArray(dig(personal, 'Contact_Data', 'Email_Address_Data'));
    const workEmail = emails.find(e => dig(e, 'Usage_Data', 'Type_Data', 'Type_Reference', 'ID')?.['#text'] === 'WORK') || emails[0];
    return {
      externalId: this._wid(dig(w, 'Worker_Reference')),
      employeeId: extractText(dig(w, 'Worker_Data'), 'Worker_ID') || null,
      email: extractText(workEmail, 'Email_Address') || null,
      legalName: nameData ? `${extractText(nameData, 'First_Name') || ''} ${extractText(nameData, 'Last_Name') || ''}`.trim() : 'Unknown',
      preferredName: null,
      positionTitle: extractText(position, 'Position_Title') || null,
      positionExternalId: this._wid(dig(position, 'Position_Reference')),
      organizationName: extractText(asArray(dig(position, 'Position_Organizations_Data', 'Position_Organization_Data'))[0], 'Organization_Name') || null,
      managerExternalId: this._wid(dig(employment, 'Manager_Reference')),
      status: statusData && extractText(statusData, 'Termination_Date') ? 'terminated' : 'active',
      hireDate: extractText(statusData, 'Hire_Date') || null,
      terminationDate: extractText(statusData, 'Termination_Date') || null,
    };
  }

  async fetchOrganizations() {
    const all = [];
    let page = 1, totalPages = 1;
    while (page <= totalPages) {
      const body = `<Get_Organizations_Request xmlns="urn:com.workday/bsvc" version="v42.0"><Response_Filter><Page>${page}</Page><Count>200</Count></Response_Filter></Get_Organizations_Request>`;
      const xml = await this._soap('Human_Resources/v42.0', body);
      const resp = dig(xml, 'Envelope', 'Body', 'Get_Organizations_Response');
      if (!resp) break;
      const results = dig(resp, 'Response_Results');
      if (results) totalPages = parseInt(results.Total_Pages, 10) || 1;
      for (const o of asArray(dig(resp, 'Response_Data', 'Organization'))) {
        all.push({
          externalId: this._wid(dig(o, 'Organization_Reference')),
          name: extractText(dig(o, 'Organization_Data'), 'Organization_Name') || 'Unknown',
          parentExternalId: this._wid(dig(o, 'Organization_Data', 'Organization_Subtype_Data', 'Parent_Organization_Reference')),
          orgType: extractText(dig(o, 'Organization_Data', 'Organization_Subtype_Data'), 'Organization_Subtype') || null,
        });
      }
      page++;
    }
    return all;
  }

  _wid(ref) {
    if (!ref) return null;
    const ids = asArray(dig(ref, 'ID'));
    const w = ids.find(i => i?.['@_type'] === 'WID') || ids[0];
    return w?.['#text'] || (typeof w === 'string' ? w : null);
  }
}
