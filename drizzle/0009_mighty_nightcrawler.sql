-- F02: Multi-Tenant (delta)
-- La migración anterior generada por drizzle-kit duplicaba tablas/columnas de F03-F07.
-- Este delta añade solo lo nuevo de F02: tipo membership_role, tabla invitations,
-- columna company_id en audit_events. Todo idempotente.

-- membership_role enum (ya puede existir de F00/F01)
DO $$ BEGIN
    CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

-- Tabla de invitaciones
CREATE TABLE IF NOT EXISTS "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "membership_role" DEFAULT 'member' NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"inviter_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint

-- company_id en audit_events (ya puede existir de F01)
ALTER TABLE "audit_events" ADD COLUMN IF NOT EXISTS "company_id" uuid;--> statement-breakpoint

-- FKs y índices para invitations (idempotentes)
DO $$ BEGIN
	ALTER TABLE "invitations" ADD CONSTRAINT "invitations_company_id_companies_id_fk"
	FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk"
	FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "invitations_company_idx" ON "invitations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint

-- FK e índice para audit_events.company_id (ya puede existir de F01)
DO $$ BEGIN
	ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_company_id_companies_id_fk"
	FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "audit_events_company_idx" ON "audit_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_events_event_idx" ON "audit_events" USING btree ("event");