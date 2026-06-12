CREATE TYPE "public"."hris_provider" AS ENUM('workday', 'sap', 'adp', 'bamboohr', 'csv', 'other');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('running', 'succeeded', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."position_status" AS ENUM('filled', 'vacant', 'frozen');--> statement-breakpoint
CREATE TYPE "public"."worker_status" AS ENUM('active', 'inactive', 'terminated', 'on_leave');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"hris_provider" "hris_provider" DEFAULT 'csv',
	"workday_tenant_url" text,
	"workday_isu_username" text,
	"workday_isu_password_encrypted" text,
	"encryption_iv" text,
	"sap_api_url" text,
	"sap_company_id" text,
	"sap_oauth_token_encrypted" text,
	"adp_client_id" text,
	"adp_client_secret_encrypted" text,
	"adp_cert_encrypted" text,
	"saml_idp_metadata_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"hris_provider" "hris_provider" NOT NULL,
	"status" "import_status" DEFAULT 'running',
	"records_processed" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"file_name" text,
	"error_summary" text,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"parent_external_id" text,
	"org_type" text,
	"last_synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"title" text,
	"description" text,
	"organization_id" uuid,
	"filled_by_worker_id" uuid,
	"status" "position_status" DEFAULT 'filled',
	"last_synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" uuid NOT NULL,
	"instrument" text NOT NULL,
	"assessment_date" date,
	"intrinsic" numeric,
	"competitive" numeric,
	"power" numeric,
	"personal" numeric,
	"social" numeric,
	"entrusting" numeric,
	"collaborative" numeric,
	"contributory" numeric,
	"vicarious" numeric,
	"source" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"employee_id" text,
	"email" text,
	"legal_name" text NOT NULL,
	"preferred_name" text,
	"position_title" text,
	"position_external_id" text,
	"organization_name" text,
	"organization_id" uuid,
	"manager_external_id" text,
	"status" "worker_status" DEFAULT 'active',
	"hire_date" date,
	"termination_date" date,
	"last_synced_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_filled_by_worker_id_workers_id_fk" FOREIGN KEY ("filled_by_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;