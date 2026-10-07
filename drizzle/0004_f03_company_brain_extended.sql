CREATE TYPE "public"."branch_type" AS ENUM('sede', 'sucursal', 'oficina', 'almacen', 'punto_venta', 'otro');--> statement-breakpoint
CREATE TYPE "public"."brand_type" AS ENUM('principal', 'secundaria', 'producto', 'servicio', 'franquicia');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('commercial', 'talent', 'hybrid');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"brand_id" uuid,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"type" "branch_type" DEFAULT 'sucursal' NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'Argentina',
	"postal_code" text,
	"phone" text,
	"email" text,
	"latitude" text,
	"longitude" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_headquarters" boolean DEFAULT false NOT NULL,
	"opening_hours" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#3b82f6',
	"secondary_color" text DEFAULT '#1e40af',
	"type" "brand_type" DEFAULT 'principal' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"website" text,
	"social_linkedin" text,
	"social_instagram" text,
	"social_twitter" text,
	"social_facebook" text,
	"social_tiktok" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"brand_id" uuid,
	"branch_id" uuid,
	"name" text NOT NULL,
	"type" "profile_type" NOT NULL,
	"description" text,
	"responsible_user_id" uuid,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"kpis" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_responsible_user_id_users_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "branches_company_idx" ON "branches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "branches_brand_idx" ON "branches" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "branches_company_code_unique" ON "branches" USING btree ("company_id","code");--> statement-breakpoint
CREATE INDEX "brands_company_idx" ON "brands" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brands_company_slug_unique" ON "brands" USING btree ("company_id","slug");--> statement-breakpoint
CREATE INDEX "profiles_company_idx" ON "profiles" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "profiles_brand_idx" ON "profiles" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "profiles_branch_idx" ON "profiles" USING btree ("branch_id");