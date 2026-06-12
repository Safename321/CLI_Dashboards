import { getDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { ingestWorkers as ingestWorkersMemory } from './workdayStore.js';

export async function importWorkers(customerId, workers, { fileName = null, provider = 'csv' } = {}) {
  const db = getDb();
  if (!db) {
    const memWorkers = workers.map(w => ({
      workdayId: w.externalId, employeeId: w.employeeId, email: w.email, legalName: w.legalName,
      preferredName: w.preferredName, positionTitle: w.positionTitle, positionWorkdayId: w.positionExternalId,
      organization: w.organizationName, managerWorkdayId: w.managerExternalId, status: w.status,
      hireDate: w.hireDate, terminationDate: w.terminationDate,
    }));
    return ingestWorkersMemory(customerId, memWorkers, { fileName });
  }

  const [importRun] = await db.insert(schema.importRuns).values({ customerId, hrisProvider: provider, status: 'running', fileName }).returning();
  let inserted = 0, updated = 0;
  const errors = [];
  const now = new Date();

  for (const w of workers) {
    try {
      const existing = await db.select({ id: schema.workers.id }).from(schema.workers)
        .where(and(eq(schema.workers.customerId, customerId), eq(schema.workers.externalId, w.externalId))).limit(1);
      if (existing.length > 0) {
        await db.update(schema.workers).set({
          employeeId: w.employeeId, email: w.email, legalName: w.legalName, preferredName: w.preferredName,
          positionTitle: w.positionTitle, positionExternalId: w.positionExternalId, organizationName: w.organizationName,
          managerExternalId: w.managerExternalId, status: w.status, hireDate: w.hireDate, terminationDate: w.terminationDate, lastSyncedAt: now,
        }).where(eq(schema.workers.id, existing[0].id));
        updated++;
      } else {
        await db.insert(schema.workers).values({
          customerId, externalId: w.externalId, employeeId: w.employeeId, email: w.email, legalName: w.legalName,
          preferredName: w.preferredName, positionTitle: w.positionTitle, positionExternalId: w.positionExternalId,
          organizationName: w.organizationName, managerExternalId: w.managerExternalId, status: w.status,
          hireDate: w.hireDate, terminationDate: w.terminationDate, lastSyncedAt: now,
        });
        inserted++;
      }
    } catch (err) { errors.push({ externalId: w.externalId, error: err.message }); }
  }

  const status = errors.length === 0 ? 'succeeded' : (inserted + updated > 0 ? 'partial' : 'failed');
  await db.update(schema.importRuns).set({ status, recordsProcessed: inserted + updated, recordsFailed: errors.length, errorSummary: errors.length > 0 ? JSON.stringify(errors.slice(0, 20)) : null, finishedAt: new Date() }).where(eq(schema.importRuns.id, importRun.id));
  return { inserted, updated, total: inserted + updated, importRunId: importRun.id, errors };
}

export async function importOrganizations(customerId, orgs) {
  const db = getDb();
  if (!db) return { inserted: 0, updated: 0 };
  let inserted = 0, updated = 0;
  const now = new Date();
  for (const o of orgs) {
    const existing = await db.select({ id: schema.organizations.id }).from(schema.organizations)
      .where(and(eq(schema.organizations.customerId, customerId), eq(schema.organizations.externalId, o.externalId))).limit(1);
    if (existing.length > 0) {
      await db.update(schema.organizations).set({ name: o.name, parentExternalId: o.parentExternalId, orgType: o.orgType, lastSyncedAt: now }).where(eq(schema.organizations.id, existing[0].id));
      updated++;
    } else {
      await db.insert(schema.organizations).values({ customerId, externalId: o.externalId, name: o.name, parentExternalId: o.parentExternalId, orgType: o.orgType, lastSyncedAt: now });
      inserted++;
    }
  }
  return { inserted, updated };
}

export async function runImport(adapter, customerId, { fileName = null } = {}) {
  const [workers, orgs] = await Promise.all([adapter.fetchWorkers(), adapter.fetchOrganizations()]);
  const workerResult = await importWorkers(customerId, workers, { fileName, provider: adapter.constructor.id });
  const orgResult = await importOrganizations(customerId, orgs);
  return { provider: adapter.constructor.id, workers: workerResult, organizations: orgResult };
}
