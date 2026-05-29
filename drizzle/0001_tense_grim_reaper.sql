CREATE TABLE "template_customizations" (
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"config" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_customizations_user_id_template_id_pk" PRIMARY KEY("user_id","template_id")
);
--> statement-breakpoint
ALTER TABLE "template_customizations" ADD CONSTRAINT "template_customizations_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;