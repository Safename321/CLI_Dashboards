import { describe, it, expect } from 'vitest';
import { parseCsv, parseWorkersCsv } from '../../cli-proxy-server/lib/workersCsv.js';

describe('parseCsv (RFC-4180 basics)', () => {
  it('parses quoted fields with embedded commas and escaped quotes', () => {
    const rows = parseCsv('a,"b, with comma","say ""hi"""\n1,2,3');
    expect(rows).toEqual([
      ['a', 'b, with comma', 'say "hi"'],
      ['1', '2', '3'],
    ]);
  });

  it('handles CRLF line endings and trailing newline', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('handles newlines inside quoted fields', () => {
    const rows = parseCsv('a,b\n"line1\nline2",x');
    expect(rows[1][0]).toBe('line1\nline2');
  });

  it('skips blank lines', () => {
    expect(parseCsv('a,b\n\n1,2\n\n')).toHaveLength(2);
  });
});

describe('parseWorkersCsv — schema validation to the normalized worker shape', () => {
  const HEADER = 'Workday ID,Legal Name,Email,Status,Hire Date,Termination Date,Manager Workday ID,Organization';

  it('normalizes aliased headers and fills defaults', () => {
    const { ok, workers, errors } = parseWorkersCsv(`${HEADER}\nWID-1,Jane Doe,jane@x.com,,2020-01-15,,WID-9,Engineering`);
    expect(ok).toBe(true);
    expect(errors).toEqual([]);
    expect(workers).toEqual([
      {
        workdayId: 'WID-1',
        legalName: 'Jane Doe',
        email: 'jane@x.com',
        status: 'active', // default when blank
        hireDate: '2020-01-15',
        managerWorkdayId: 'WID-9',
        organization: 'Engineering',
      },
    ]);
  });

  it('normalizes status spelling ("On Leave" → on_leave)', () => {
    const { workers } = parseWorkersCsv(`workday_id,legal_name,status\nW1,A,On Leave`);
    expect(workers[0].status).toBe('on_leave');
  });

  it('rejects the whole file when required columns are missing', () => {
    const { ok, workers, errors } = parseWorkersCsv('email,name_ish\na@x.com,Jane');
    expect(ok).toBe(false);
    expect(workers).toEqual([]);
    expect(errors[0].error).toMatch(/Missing required column/);
    expect(errors[0].error).toMatch(/workdayId/);
  });

  it('collects row-level errors without rejecting good rows', () => {
    const csv = [
      'workday_id,legal_name,status,hire_date',
      'W1,Jane,active,2020-01-01', // good
      ',NoWid,active,', // missing WID
      'W2,,active,', // missing legal name
      'W3,Bad Status,flying,', // invalid status
      'W4,Bad Date,active,01/02/2020', // invalid date
      'W1,Dup Wid,active,', // duplicate WID
      'W5,Good Two,terminated,2019-05-05', // good
    ].join('\n');
    const { ok, workers, errors } = parseWorkersCsv(csv);
    expect(ok).toBe(true);
    expect(workers.map((w) => w.workdayId)).toEqual(['W1', 'W5']);
    expect(errors).toHaveLength(5);
    expect(errors.map((e) => e.row)).toEqual([3, 4, 5, 6, 7]); // 1-based CSV lines
    expect(errors[0].error).toMatch(/workdayId/);
    expect(errors[2].error).toMatch(/Invalid status "flying"/);
    expect(errors[3].error).toMatch(/not a valid YYYY-MM-DD/);
    expect(errors[4].error).toMatch(/Duplicate workdayId/);
  });

  it('is ok:false when every row fails validation', () => {
    const { ok, workers, errors } = parseWorkersCsv('workday_id,legal_name\n,NoWid');
    expect(ok).toBe(false);
    expect(workers).toEqual([]);
    expect(errors).toHaveLength(1);
  });

  it('rejects empty / header-only input', () => {
    expect(parseWorkersCsv('').ok).toBe(false);
    expect(parseWorkersCsv('workday_id,legal_name').ok).toBe(false);
  });

  it('caps rows at maxRows and reports the truncation', () => {
    const rows = Array.from({ length: 5 }, (_, i) => `W${i},Name ${i}`);
    const { workers, errors } = parseWorkersCsv(`workday_id,legal_name\n${rows.join('\n')}`, { maxRows: 3 });
    expect(workers).toHaveLength(3);
    expect(errors.at(-1).error).toMatch(/exceeds 3 rows/);
  });
});
