CREATE TABLE "integration_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"provider" text NOT NULL,
	"external_account_id" text NOT NULL,
	"display_name" text,
	"status" text DEFAULT 'connected' NOT NULL,
	"connected_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integration_accounts_organization_id_provider_external_account_id_unique" UNIQUE("organization_id","provider","external_account_id")
);
--> statement-breakpoint
CREATE TABLE "report_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"report_key" text NOT NULL,
	"provider" text NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_connections_organization_id_report_key_provider_unique" UNIQUE("organization_id","report_key","provider")
);
--> statement-breakpoint
ALTER TABLE "report_connections" ADD CONSTRAINT "report_connections_account_id_integration_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."integration_accounts"("id") ON DELETE cascade ON UPDATE no action;