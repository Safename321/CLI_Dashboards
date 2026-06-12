import { pgTable, uuid, text, timestamp, date, numeric, pgEnum, integer } from 'drizzle-orm/pg-core';

export const workerStatusEnum = pgEnum('worker_status', ['active', 'inactive', 'terminated', 'on_leave']);
export const positionStatusEnum = pgEnum('position_status', ['filled', 'vacant', 'frozen']);
export const hrisProviderEnum = pgEnum('hris_provider', ['workday', 'sap', 'adp', 'bamboohr', 'csv', 'other']);
export const importStatusEnum = pgEnum('import_status', ['running', 'succeeded', 'failed', 'partial']);

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  hrisProvider: hrisProviderEnum('hris_provider').default('csv'),
  workdayTenantUrl: text('workday_tenant_url'),
  workdayIsuUsername: text('workday_isu_username'),
  workdayIsuPasswordEncrypted: text('workday_isu_password_encrypted'),
  encryptionIv: text('encryption_iv'),
  sapApiUrl: text('sap_api_url'),
  sapCompanyId: text('sap_company_id'),
  sapOauthTokenEncrypted: text('sap_oauth_token_encrypted'),
  adpClientId: text('adp_client_id'),
  adpClientSecretEncrypted: text('adp_client_secret_encrypted'),
  adpCertEncrypted: text('adp_cert_encrypted'),
  samlIdpMetadataUrl: text('saml_idp_metadata_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  externalId: text('external_id').notNull(),
  name: text('name').notNull(),
  parentExternalId: text('parent_external_id'),
  orgType: text('org_type'),
  lastSyncedAt: timestamp('last_synced_at'),
});

export const workers = pgTable('workers', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  externalId: text('external_id').notNull(),
  employeeId: text('employee_id'),
  email: text('email'),
  legalName: text('legal_name').notNull(),
  preferredName: text('preferred_name'),
  positionTitle: text('position_title'),
  positionExternalId: text('position_external_id'),
  organizationName: text('organization_name'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  managerExternalId: text('manager_external_id'),
  status: workerStatusEnum('status').default('active'),
  hireDate: date('hire_date'),
  terminationDate: date('termination_date'),
  lastSyncedAt: timestamp('last_synced_at'),
});

export const positions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  externalId: text('external_id').notNull(),
  title: text('title'),
  description: text('description'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  filledByWorkerId: uuid('filled_by_worker_id').references(() => workers.id),
  status: positionStatusEnum('status').default('filled'),
  lastSyncedAt: timestamp('last_synced_at'),
});

export const scores = pgTable('scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  workerId: uuid('worker_id').notNull().references(() => workers.id),
  instrument: text('instrument').notNull(),
  assessmentDate: date('assessment_date'),
  intrinsic: numeric('intrinsic'),
  competitive: numeric('competitive'),
  power: numeric('power'),
  personal: numeric('personal'),
  social: numeric('social'),
  entrusting: numeric('entrusting'),
  collaborative: numeric('collaborative'),
  contributory: numeric('contributory'),
  vicarious: numeric('vicarious'),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const importRuns = pgTable('import_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  hrisProvider: hrisProviderEnum('hris_provider').notNull(),
  status: importStatusEnum('status').default('running'),
  recordsProcessed: integer('records_processed').default(0),
  recordsFailed: integer('records_failed').default(0),
  fileName: text('file_name'),
  errorSummary: text('error_summary'),
  startedAt: timestamp('started_at').defaultNow(),
  finishedAt: timestamp('finished_at'),
});
