// Phase-1 Workday bridge: parse + schema-validate a workers CSV into the
// normalized CLI worker shape (WorkDay/02-data-model-mapping.md, `workers`
// table). Identity key is the immutable Workday ID (WID) — never email or
// employee number. Row-level errors are collected, not thrown, so one bad row
// doesn't reject a 5,000-row file; structural problems (missing required
// columns) fail the whole parse.

export const WORKER_STATUSES = ['active', 'inactive', 'terminated', 'on_leave'];

// Header matching is forgiving: lowercase, strip everything non-alphanumeric,
// then look up. Lets "Workday ID", "workday_id" and "workdayId" all work.
const HEADER_ALIASES = {
  workdayid: 'workdayId',
  wid: 'workdayId',
  employeeid: 'employeeId',
  workdayemployeeid: 'employeeId',
  workerid: 'employeeId',
  email: 'email',
  emailaddress: 'email',
  workemail: 'email',
  legalname: 'legalName',
  name: 'legalName',
  preferredname: 'preferredName',
  positionworkdayid: 'positionWorkdayId',
  primarypositionworkdayid: 'positionWorkdayId',
  positionid: 'positionWorkdayId',
  positiontitle: 'positionTitle',
  title: 'positionTitle',
  organization: 'organization',
  organizationname: 'organization',
  org: 'organization',
  managerworkdayid: 'managerWorkdayId',
  managerid: 'managerWorkdayId',
  status: 'status',
  hiredate: 'hireDate',
  terminationdate: 'terminationDate',
};

const REQUIRED_FIELDS = ['workdayId', 'legalName'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Minimal RFC-4180 parser: quoted fields, "" escapes, commas/newlines inside
// quotes, CRLF or LF, trailing newline. Returns an array of string arrays.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop rows that are entirely empty (blank lines).
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function normalizeHeader(h) {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeStatus(raw) {
  const s = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return WORKER_STATUSES.includes(s) ? s : null;
}

function validDate(raw) {
  return DATE_RE.test(raw) && !Number.isNaN(Date.parse(raw));
}

// Parse + validate a workers CSV. Returns { ok, workers, errors }:
//  - ok: headers were usable and at least one row validated
//  - workers: normalized worker objects (canonical key: workdayId)
//  - errors: [{ row, error }] — row is the 1-based CSV line (header = 1)
export function parseWorkersCsv(text, { maxRows = 50000 } = {}) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { ok: false, workers: [], errors: [{ row: 0, error: 'Empty CSV body' }] };
  }
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { ok: false, workers: [], errors: [{ row: 0, error: 'CSV needs a header row and at least one data row' }] };
  }

  const fields = rows[0].map((h) => HEADER_ALIASES[normalizeHeader(h)] || null);
  const present = new Set(fields.filter(Boolean));
  const missing = REQUIRED_FIELDS.filter((f) => !present.has(f));
  if (missing.length > 0) {
    return {
      ok: false,
      workers: [],
      errors: [{ row: 1, error: `Missing required column(s): ${missing.join(', ')} (accepted aliases include "Workday ID", "Legal Name")` }],
    };
  }

  const workers = [];
  const errors = [];
  const seenWids = new Set();

  for (let r = 1; r < rows.length && workers.length < maxRows; r++) {
    const line = r + 1; // human-facing CSV line number
    const w = {};
    rows[r].forEach((cell, i) => {
      const f = fields[i];
      if (f) w[f] = cell.trim();
    });

    if (!w.workdayId) {
      errors.push({ row: line, error: 'Missing workdayId (WID) — the canonical worker key' });
      continue;
    }
    if (seenWids.has(w.workdayId)) {
      errors.push({ row: line, error: `Duplicate workdayId "${w.workdayId}" in this file` });
      continue;
    }
    if (!w.legalName) {
      errors.push({ row: line, error: 'Missing legalName' });
      continue;
    }
    if (w.status) {
      const s = normalizeStatus(w.status);
      if (!s) {
        errors.push({ row: line, error: `Invalid status "${w.status}" (expected one of: ${WORKER_STATUSES.join(', ')})` });
        continue;
      }
      w.status = s;
    } else {
      w.status = 'active';
    }
    let badDate = null;
    for (const df of ['hireDate', 'terminationDate']) {
      if (w[df] && !validDate(w[df])) badDate = `${df} "${w[df]}" is not a valid YYYY-MM-DD date`;
      if (!w[df]) delete w[df];
    }
    if (badDate) {
      errors.push({ row: line, error: badDate });
      continue;
    }
    // Drop empty optional cells so the stored shape stays sparse.
    for (const k of Object.keys(w)) if (w[k] === '') delete w[k];

    seenWids.add(w.workdayId);
    workers.push(w);
  }

  if (rows.length - 1 > maxRows) {
    errors.push({ row: maxRows + 2, error: `File exceeds ${maxRows} rows — remaining rows ignored` });
  }

  return { ok: workers.length > 0, workers, errors };
}
