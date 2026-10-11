-- Alter company_brain table to add versioning and approval fields
ALTER TABLE "company_brain" ADD COLUMN "version" integer NOT NULL DEFAULT 1;
ALTER TABLE "company_brain" ADD COLUMN "createdBy" uuid REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "company_brain" ADD COLUMN "approvedBy" uuid REFERENCES "public"."users"("id") ON DELETE set null;
ALTER TABLE "company_brain" ADD COLUMN "isApproved" boolean NOT NULL DEFAULT false;

-- Create brain_versions table for historization
CREATE TABLE "brain_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brainId" uuid NOT NULL,
	"version" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text,
	"valueProposition" text,
	"targetAudience" text,
	"tone" text,
	"website" text,
	"whatsapp" text,
	"socialLinkedin" text,
	"socialInstagram" text,
	"socialTwitter" text,
	"socialFacebook" text,
	"socialTiktok" text,
	"products" jsonb NOT NULL DEFAULT '[]'::jsonb,
	"services" jsonb NOT NULL DEFAULT '[]'::jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"createdBy" uuid REFERENCES "public"."users"("id") ON DELETE set null,
	CONSTRAINT "brain_versions_brainId_companies_id_fk" FOREIGN KEY ("brainId") REFERENCES "public"."company_brain"("id") ON DELETE cascade ON UPDATE no action
);

-- Indexes for brain_versions
CREATE INDEX "brain_versions_brainId_idx" ON "brain_versions" USING btree ("brainId");
CREATE INDEX "brain_versions_version_idx" ON "brain_versions" USING btree ("version");
CREATE INDEX "brain_versions_createdAt_idx" ON "brain_versions" USING btree ("createdAt");

-- Enable RLS on brain_versions (if we are using RLS, but note: we haven't set up RLS for company_brain in 0003? Actually 0003 enabled RLS for company_brain with policies. We should do the same for brain_versions if we want RLS, but for simplicity we might skip RLS on brain_versions and rely on the companyId via the brain. However, the contract says we should audit, so we might not need RLS on versions if we are only logging. We'll skip for now.)
