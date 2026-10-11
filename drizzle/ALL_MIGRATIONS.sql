CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);


CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

CREATE TYPE "public"."campaign_channel" AS ENUM('facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'email', 'whatsapp', 'web', 'otro');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."candidate_status" AS ENUM('nuevo', 'preseleccion', 'contacto', 'entrevista', 'finalista', 'oferta', 'contratado', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('post', 'ad', 'script', 'email', 'story', 'reel', 'article', 'hook', 'cta', 'hashtags');--> statement-breakpoint
CREATE TYPE "public"."job_modality" AS ENUM('presencial', 'hibrido', 'remoto');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'published', 'paused', 'closed', 'filled');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('website', 'facebook', 'instagram', 'linkedin', 'referral', 'cold_call', 'email', 'event', 'ads', 'organic', 'otro');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('nuevo', 'contactado', 'calificado', 'propuesta', 'ganado', 'perdido');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('producto', 'servicio', 'curso', 'suscripcion', 'otro');--> statement-breakpoint
CREATE TABLE "audiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar_name" text,
	"demographics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"needs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"pains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"motivations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"objections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tone" text DEFAULT 'profesional',
	"cta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"objective" text,
	"product_id" uuid,
	"audience_id" uuid,
	"channel" "campaign_channel" DEFAULT 'web' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"vacancy_id" uuid,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"cv_url" text,
	"experience" text,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" text DEFAULT 'direct',
	"status" "candidate_status" DEFAULT 'nuevo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#3b82f6',
	"secondary_color" text DEFAULT '#1e40af',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "company_brain" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"industry" text,
	"value_proposition" text,
	"target_audience" text,
	"tone" text DEFAULT 'profesional',
	"website" text,
	"whatsapp" text,
	"social_linkedin" text,
	"social_instagram" text,
	"social_twitter" text,
	"social_facebook" text,
	"social_tiktok" text,
	"products" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_brain_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "generated_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"product_id" uuid,
	"audience_id" uuid,
	"campaign_id" uuid,
	"type" "content_type" NOT NULL,
	"prompt" text NOT NULL,
	"input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"variants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"tokens_used" integer,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"campaign_id" uuid,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"company" text,
	"source" "lead_source" DEFAULT 'organic' NOT NULL,
	"status" "lead_status" DEFAULT 'nuevo' NOT NULL,
	"assigned_to" uuid,
	"notes" text,
	"value" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"role" "membership_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "product_category" DEFAULT 'producto' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"benefits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"modality" "job_modality" DEFAULT 'hibrido' NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_brain" ADD CONSTRAINT "company_brain_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audiences_company_idx" ON "audiences" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "campaigns_company_idx" ON "campaigns" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "candidates_company_idx" ON "candidates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "candidates_vacancy_idx" ON "candidates" USING btree ("vacancy_id");--> statement-breakpoint
CREATE INDEX "candidates_status_idx" ON "candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generated_content_company_idx" ON "generated_content" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "generated_content_product_idx" ON "generated_content" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "generated_content_audience_idx" ON "generated_content" USING btree ("audience_id");--> statement-breakpoint
CREATE INDEX "generated_content_campaign_idx" ON "generated_content" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "leads_company_idx" ON "leads" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "leads_campaign_idx" ON "leads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_assigned_idx" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_user_company_unique" ON "memberships" USING btree ("user_id","company_id");--> statement-breakpoint
CREATE INDEX "memberships_company_idx" ON "memberships" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "products_company_idx" ON "products" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vacancies_company_idx" ON "vacancies" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "vacancies_status_idx" ON "vacancies" USING btree ("status");

-- F02: RLS Policies para multi-tenant isolation
-- Habilita RLS en todas las tablas con company_id y crea policies basadas en session variable

-- FunciÃ³n helper para obtener company_id actual de la sesiÃ³n
CREATE OR REPLACE FUNCTION current_company_id() RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.current_company_id', true)::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
EXCEPTION WHEN OTHERS THEN
  RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FunciÃ³n helper para obtener user_id actual de la sesiÃ³n
CREATE OR REPLACE FUNCTION current_user_id() RETURNS uuid AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.current_user_id', true)::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
EXCEPTION WHEN OTHERS THEN
  RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FunciÃ³n para verificar si usuario es miembro de la empresa
CREATE OR REPLACE FUNCTION is_company_member(p_company_id uuid, p_user_id uuid) RETURNS boolean AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM memberships
  WHERE company_id = p_company_id AND user_id = p_user_id;
  RETURN v_role IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FunciÃ³n para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(p_company_id uuid, p_user_id uuid, p_required_role text) RETURNS boolean AS $$
DECLARE
  v_role text;
  v_hierarchy int;
  v_required_hierarchy int;
BEGIN
  SELECT role INTO v_role
  FROM memberships
  WHERE company_id = p_company_id AND user_id = p_user_id;
  
  IF v_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- JerarquÃ­a: owner=4, admin=3, member=2, viewer=1
  CASE v_role
    WHEN 'owner' THEN v_hierarchy := 4;
    WHEN 'admin' THEN v_hierarchy := 3;
    WHEN 'member' THEN v_hierarchy := 2;
    WHEN 'viewer' THEN v_hierarchy := 1;
    ELSE v_hierarchy := 0;
  END CASE;
  
  CASE p_required_role
    WHEN 'owner' THEN v_required_hierarchy := 4;
    WHEN 'admin' THEN v_required_hierarchy := 3;
    WHEN 'member' THEN v_required_hierarchy := 2;
    WHEN 'viewer' THEN v_required_hierarchy := 1;
    ELSE v_required_hierarchy := 0;
  END CASE;
  
  RETURN v_hierarchy >= v_required_hierarchy;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HABILITAR RLS EN TABLAS TENANT
-- =============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_brain ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES: companies
-- =============================================

CREATE POLICY companies_select ON companies
  FOR SELECT USING (
    id = current_company_id() 
    AND is_company_member(id, current_user_id())
  );

CREATE POLICY companies_insert ON companies
  FOR INSERT WITH CHECK (
    current_company_id() = '00000000-0000-0000-0000-000000000000'::uuid
  );

CREATE POLICY companies_update ON companies
  FOR UPDATE USING (
    id = current_company_id()
    AND has_permission(id, current_user_id(), 'admin')
  );

CREATE POLICY companies_delete ON companies
  FOR DELETE USING (
    id = current_company_id()
    AND has_permission(id, current_user_id(), 'owner')
  );

-- =============================================
-- POLICIES: memberships
-- =============================================

CREATE POLICY memberships_select ON memberships
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY memberships_insert ON memberships
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

CREATE POLICY memberships_update ON memberships
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

CREATE POLICY memberships_delete ON memberships
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'owner')
    AND user_id != current_user_id()
  );

-- =============================================
-- POLICIES: company_brain
-- =============================================

CREATE POLICY company_brain_select ON company_brain
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY company_brain_upsert ON company_brain
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

CREATE POLICY company_brain_update ON company_brain
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: products
-- =============================================

CREATE POLICY products_select ON products
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY products_update ON products
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY products_delete ON products
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: audiences
-- =============================================

CREATE POLICY audiences_select ON audiences
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY audiences_insert ON audiences
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY audiences_update ON audiences
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY audiences_delete ON audiences
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: generated_content
-- =============================================

CREATE POLICY generated_content_select ON generated_content
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY generated_content_insert ON generated_content
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY generated_content_update ON generated_content
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY generated_content_delete ON generated_content
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: campaigns
-- =============================================

CREATE POLICY campaigns_select ON campaigns
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY campaigns_insert ON campaigns
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY campaigns_update ON campaigns
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY campaigns_delete ON campaigns
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: leads
-- =============================================

CREATE POLICY leads_select ON leads
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY leads_insert ON leads
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY leads_update ON leads
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY leads_delete ON leads
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: vacancies
-- =============================================

CREATE POLICY vacancies_select ON vacancies
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY vacancies_insert ON vacancies
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY vacancies_update ON vacancies
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY vacancies_delete ON vacancies
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- POLICIES: candidates
-- =============================================

CREATE POLICY candidates_select ON candidates
  FOR SELECT USING (
    company_id = current_company_id()
    AND is_company_member(company_id, current_user_id())
  );

CREATE POLICY candidates_insert ON candidates
  FOR INSERT WITH CHECK (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY candidates_update ON candidates
  FOR UPDATE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'member')
  );

CREATE POLICY candidates_delete ON candidates
  FOR DELETE USING (
    company_id = current_company_id()
    AND has_permission(company_id, current_user_id(), 'admin')
  );

-- =============================================
-- GRANTS PARA ROLES DE APLICACIÃ“N
-- =============================================

-- Crear rol de aplicaciÃ³n si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END $$;

-- Otorgar permisos en tablas al rol app_user
GRANT SELECT, INSERT, UPDATE, DELETE ON 
  companies, memberships, company_brain, products, audiences, 
  generated_content, campaigns, leads, vacancies, candidates
TO app_user;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =============================================
-- COMENTARIOS
-- =============================================

COMMENT ON FUNCTION current_company_id() IS 'Retorna el company_id actual desde la variable de sesiÃ³n app.current_company_id';
COMMENT ON FUNCTION current_user_id() IS 'Retorna el user_id actual desde la variable de sesiÃ³n app.current_user_id';
COMMENT ON FUNCTION is_company_member(uuid, uuid) IS 'Verifica si un usuario es miembro de una empresa';
COMMENT ON FUNCTION has_permission(uuid, uuid, text) IS 'Verifica si un usuario tiene al menos el rol requerido en una empresa';

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

-- F04: CatÃ¡logo Avanzado - Tablas de catÃ¡logo, ofertas, variantes, categorÃ­as, etc.

-- Enums (idempotentes)
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived', 'discontinued');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('producto', 'servicio', 'curso', 'suscripcion', 'otro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE offer_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping', 'bundle', 'loyalty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CategorÃ­as
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image text,
    icon text,
    sort_order integer DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_company_slug_unique ON categories (company_id, slug);
CREATE INDEX IF NOT EXISTS categories_company_idx ON categories (company_id);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories (parent_id);

-- Productos (versiÃ³n extendida)
-- Nota: products ya existe, solo aÃ±adimos columnas nuevas si no existen
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos jsonb DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_digital boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS digital_file_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_shipping boolean NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS taxable boolean NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_class text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory boolean NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_quantity integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;
ALTER TABLE products ADD COLUMN IF NOT EXISTS allow_backorder boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}';

-- Actualizar status a enum product_status (manejando default)
DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN status DROP DEFAULT;
EXCEPTION WHEN others THEN NULL; END $$;

UPDATE products SET status = 'draft' WHERE status NOT IN ('draft', 'active', 'archived', 'discontinued');

DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::product_status;
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE products ALTER COLUMN status SET DEFAULT 'draft';

-- Actualizar category a enum product_category
DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN category TYPE product_category USING category::product_category;
EXCEPTION WHEN others THEN NULL; END $$;

-- Ãndices y constraints nuevos
CREATE UNIQUE INDEX IF NOT EXISTS products_company_slug_unique ON products (company_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_company_sku_unique ON products (company_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);

-- Variantes de producto
CREATE TABLE IF NOT EXISTS product_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name text NOT NULL,
    sku text NOT NULL,
    barcode text,
    price integer,
    compare_at_price integer,
    cost_price integer,
    weight integer,
    dimensions jsonb DEFAULT '{}',
    inventory_quantity integer NOT NULL DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    option_values jsonb NOT NULL DEFAULT '{}',
    position integer DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    image text,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_product_sku_unique ON product_variants (product_id, sku);
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants (product_id);

-- Opciones de producto
CREATE TABLE IF NOT EXISTS product_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL DEFAULT 'select',
    position integer DEFAULT 0,
    values jsonb NOT NULL DEFAULT '[]',
    is_required boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS product_options_product_idx ON product_options (product_id);

-- Ofertas / Promociones
DO $$ BEGIN
    CREATE TYPE offer_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping', 'bundle', 'loyalty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE offer_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type offer_type NOT NULL,
    value integer NOT NULL,
    min_purchase_amount integer,
    max_discount_amount integer,
    usage_limit integer,
    usage_count integer NOT NULL DEFAULT 0,
    usage_limit_per_customer integer,
    starts_at timestamptz,
    ends_at timestamptz,
    status offer_status NOT NULL DEFAULT 'draft',
    applies_to jsonb DEFAULT '{}',
    conditions jsonb DEFAULT '{}',
    coupon_code text,
    is_auto_apply boolean NOT NULL DEFAULT false,
    priority integer DEFAULT 0,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS offers_company_slug_unique ON offers (company_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS offers_company_coupon_unique ON offers (company_id, coupon_code) WHERE coupon_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS offers_company_idx ON offers (company_id);

-- RelaciÃ³n oferta-producto
CREATE TABLE IF NOT EXISTS offer_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS offer_products_unique ON offer_products (offer_id, product_id);
CREATE INDEX IF NOT EXISTS offer_products_offer_idx ON offer_products (offer_id);
CREATE INDEX IF NOT EXISTS offer_products_product_idx ON offer_products (product_id);

-- Tiers de precios (quantity breaks)
CREATE TABLE IF NOT EXISTS price_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name text NOT NULL,
    min_quantity integer NOT NULL,
    max_quantity integer,
    price integer NOT NULL,
    is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS price_tiers_product_idx ON price_tiers (product_id);

-- Ãndices adicionales para products
CREATE UNIQUE INDEX IF NOT EXISTS products_company_slug_unique ON products (company_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_company_sku_unique ON products (company_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id);

-- Status enum update for products (handle default)
DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN status DROP DEFAULT;
EXCEPTION WHEN others THEN NULL; END $$;

UPDATE products SET status = 'draft' WHERE status NOT IN ('draft', 'active', 'archived', 'discontinued');

DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN status TYPE product_status USING status::product_status;
EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE products ALTER COLUMN status SET DEFAULT 'draft';

-- Actualizar category a enum product_category
DO $$ BEGIN
    ALTER TABLE products ALTER COLUMN category TYPE product_category USING category::product_category;
EXCEPTION WHEN others THEN NULL; END $$;

-- F05: Audiencias Avanzadas - Segmentos, Candidate Personas, Scoring, Insights

-- Enums
DO $$ BEGIN
    CREATE TYPE segment_type AS ENUM ('demographic', 'behavioral', 'psychographic', 'firmographic', 'technographic', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE segment_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE candidate_persona_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Segmentos de audiencia
CREATE TABLE IF NOT EXISTS audience_segments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    audience_id uuid NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type segment_type NOT NULL,
    status segment_status NOT NULL DEFAULT 'draft',
    criteria jsonb NOT NULL DEFAULT '{}',
    estimated_size integer,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS segments_audience_slug_unique ON audience_segments (audience_id, slug);
CREATE INDEX IF NOT EXISTS segments_company_idx ON audience_segments (company_id);
CREATE INDEX IF NOT EXISTS segments_audience_idx ON audience_segments (audience_id);

-- Candidate Personas
DO $$ BEGIN
    CREATE TYPE candidate_persona_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS candidate_personas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vacancy_id uuid REFERENCES vacancies(id) ON DELETE SET NULL,
    name text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    summary text,
    demographics jsonb NOT NULL DEFAULT '{}',
    skills jsonb NOT NULL DEFAULT '[]',
    experience jsonb NOT NULL DEFAULT '{}',
    motivations jsonb NOT NULL DEFAULT '[]',
    pain_points jsonb NOT NULL DEFAULT '[]',
    preferred_channels jsonb NOT NULL DEFAULT '[]',
    salary_expectations jsonb DEFAULT '{}',
    location_preferences jsonb DEFAULT '{}',
    work_style jsonb DEFAULT '{}',
    cultural_fit jsonb DEFAULT '{}',
    red_flags jsonb DEFAULT '[]',
    green_flags jsonb DEFAULT '[]',
    score_weights jsonb DEFAULT '{}',
    status candidate_persona_status NOT NULL DEFAULT 'draft',
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS candidate_personas_company_slug_unique ON candidate_personas (company_id, slug);
CREATE INDEX IF NOT EXISTS candidate_personas_company_idx ON candidate_personas (company_id);
CREATE INDEX IF NOT EXISTS candidate_personas_vacancy_idx ON candidate_personas (vacancy_id);

-- Reglas de scoring para audiencias
CREATE TABLE IF NOT EXISTS audience_scoring_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    audience_id uuid REFERENCES audiences(id) ON DELETE CASCADE,
    segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE,
    candidate_persona_id uuid REFERENCES candidate_personas(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    criteria jsonb NOT NULL DEFAULT '{}',
    weight integer NOT NULL DEFAULT 1,
    operator text NOT NULL DEFAULT 'add',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scoring_rules_company_idx ON audience_scoring_rules (company_id);
CREATE INDEX IF NOT EXISTS scoring_rules_audience_idx ON audience_scoring_rules (audience_id);
CREATE INDEX IF NOT EXISTS scoring_rules_segment_idx ON audience_scoring_rules (segment_id);
CREATE INDEX IF NOT EXISTS scoring_rules_persona_idx ON audience_scoring_rules (candidate_persona_id);

-- Insights de audiencia
CREATE TABLE IF NOT EXISTS audience_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    audience_id uuid NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    segment_id uuid REFERENCES audience_segments(id) ON DELETE SET NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    data jsonb NOT NULL DEFAULT '{}',
    confidence integer DEFAULT 0,
    source text DEFAULT 'ai',
    is_active boolean NOT NULL DEFAULT true,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS insights_company_idx ON audience_insights (company_id);
CREATE INDEX IF NOT EXISTS insights_audience_idx ON audience_insights (audience_id);
CREATE INDEX IF NOT EXISTS insights_segment_idx ON audience_insights (segment_id);

-- Ãndices para audience_segments
CREATE UNIQUE INDEX IF NOT EXISTS segments_audience_slug_unique ON audience_segments (audience_id, slug);
CREATE INDEX IF NOT EXISTS segments_company_idx ON audience_segments (company_id);
CREATE INDEX IF NOT EXISTS segments_audience_idx ON audience_segments (audience_id);

-- Ãndices para candidate_personas
CREATE UNIQUE INDEX IF NOT EXISTS candidate_personas_company_slug_unique ON candidate_personas (company_id, slug);
CREATE INDEX IF NOT EXISTS candidate_personas_company_idx ON candidate_personas (company_id);
CREATE INDEX IF NOT EXISTS candidate_personas_vacancy_idx ON candidate_personas (vacancy_id);

-- Ãndices para audience_scoring_rules
CREATE INDEX IF NOT EXISTS scoring_rules_company_idx ON audience_scoring_rules (company_id);
CREATE INDEX IF NOT EXISTS scoring_rules_audience_idx ON audience_scoring_rules (audience_id);
CREATE INDEX IF NOT EXISTS scoring_rules_segment_idx ON audience_scoring_rules (segment_id);
CREATE INDEX IF NOT EXISTS scoring_rules_persona_idx ON audience_scoring_rules (candidate_persona_id);

-- Ãndices para audience_insights
CREATE INDEX IF NOT EXISTS insights_company_idx ON audience_insights (company_id);
CREATE INDEX IF NOT EXISTS insights_audience_idx ON audience_insights (audience_id);
CREATE INDEX IF NOT EXISTS insights_segment_idx ON audience_insights (segment_id);

-- F06: Rules Engine - Reglas, Workflows, Templates, Ejecuciones

-- Enums
DO $$ BEGIN
    CREATE TYPE rule_trigger AS ENUM ('manual', 'scheduled', 'event', 'webhook', 'api', 'cron');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE rule_status AS ENUM ('draft', 'active', 'paused', 'archived', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('notification', 'email', 'webhook', 'api_call', 'create_record', 'update_record', 'delete_record', 'assign_task', 'send_message', 'generate_content', 'run_workflow', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE condition_operator AS ENUM ('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'in', 'not_in', 'exists', 'not_exists', 'matches_regex', 'is_empty', 'is_not_empty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reglas
CREATE TABLE IF NOT EXISTS rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    trigger rule_trigger NOT NULL,
    trigger_config jsonb NOT NULL DEFAULT '{}',
    status rule_status NOT NULL DEFAULT 'draft',
    priority integer DEFAULT 0,
    conditions jsonb NOT NULL DEFAULT '{}',
    actions jsonb NOT NULL DEFAULT '[]',
    execution_count integer NOT NULL DEFAULT 0,
    last_executed_at timestamptz,
    last_execution_status text,
    last_execution_error text,
    execution_timeout_ms integer DEFAULT 30000,
    max_retries integer DEFAULT 3,
    retry_delay_ms integer DEFAULT 1000,
    tags jsonb DEFAULT '[]',
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rules_company_slug_unique ON rules (company_id, slug);
CREATE INDEX IF NOT EXISTS rules_company_idx ON rules (company_id);
CREATE INDEX IF NOT EXISTS rules_status_idx ON rules (status);
CREATE INDEX IF NOT EXISTS rules_trigger_idx ON rules (trigger);

-- Ejecuciones de reglas
CREATE TABLE IF NOT EXISTS rule_executions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_id uuid NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
    trigger_data jsonb NOT NULL DEFAULT '{}',
    context jsonb NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'pending',
    result jsonb DEFAULT '{}',
    error text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    duration_ms integer,
    retry_count integer DEFAULT 0,
    meta jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS executions_company_idx ON rule_executions (company_id);
CREATE INDEX IF NOT EXISTS executions_rule_idx ON rule_executions (rule_id);
CREATE INDEX IF NOT EXISTS executions_status_idx ON rule_executions (status);
CREATE INDEX IF NOT EXISTS executions_started_idx ON rule_executions (started_at);

-- Plantillas de reglas
CREATE TABLE IF NOT EXISTS rule_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    category text,
    trigger rule_trigger NOT NULL,
    trigger_config jsonb NOT NULL DEFAULT '{}',
    conditions jsonb NOT NULL DEFAULT '{}',
    actions jsonb NOT NULL DEFAULT '[]',
    is_public boolean NOT NULL DEFAULT false,
    tags jsonb DEFAULT '[]',
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS templates_company_slug_unique ON rule_templates (company_id, slug);
CREATE INDEX IF NOT EXISTS templates_company_idx ON rule_templates (company_id);
CREATE INDEX IF NOT EXISTS templates_public_idx ON rule_templates (is_public);

-- Workflows (visual workflow builder)
CREATE TABLE IF NOT EXISTS workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'draft',
    nodes jsonb NOT NULL DEFAULT '[]',
    edges jsonb NOT NULL DEFAULT '[]',
    variables jsonb DEFAULT '{}',
    settings jsonb DEFAULT '{}',
    version integer DEFAULT 1,
    is_published boolean NOT NULL DEFAULT false,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workflows_company_slug_unique ON workflows (company_id, slug);
CREATE INDEX IF NOT EXISTS workflows_company_idx ON workflows (company_id);
CREATE INDEX IF NOT EXISTS workflows_status_idx ON workflows (status);

-- Ejecuciones de workflows
CREATE TABLE IF NOT EXISTS workflow_executions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    input_data jsonb NOT NULL DEFAULT '{}',
    status text NOT NULL DEFAULT 'pending',
    current_node_id text,
    result jsonb DEFAULT '{}',
    error text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    duration_ms integer,
    meta jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS workflow_executions_company_idx ON workflow_executions (company_id);
CREATE INDEX IF NOT EXISTS workflow_executions_workflow_idx ON workflow_executions (workflow_id);
CREATE INDEX IF NOT EXISTS workflow_executions_status_idx ON workflow_executions (status);

-- Ãndices adicionales
CREATE INDEX IF NOT EXISTS rules_company_idx ON rules (company_id);
CREATE INDEX IF NOT EXISTS rules_status_idx ON rules (status);
CREATE INDEX IF NOT EXISTS rules_trigger_idx ON rules (trigger);

CREATE INDEX IF NOT EXISTS executions_company_idx ON rule_executions (company_id);
CREATE INDEX IF NOT EXISTS executions_rule_idx ON rule_executions (rule_id);
CREATE INDEX IF NOT EXISTS executions_status_idx ON rule_executions (status);
CREATE INDEX IF NOT EXISTS executions_started_idx ON rule_executions (started_at);

CREATE INDEX IF NOT EXISTS templates_company_idx ON rule_templates (company_id);
CREATE INDEX IF NOT EXISTS templates_public_idx ON rule_templates (is_public);

CREATE INDEX IF NOT EXISTS workflows_company_idx ON workflows (company_id);
CREATE INDEX IF NOT EXISTS workflows_status_idx ON workflows (status);

CREATE INDEX IF NOT EXISTS workflow_executions_company_idx ON workflow_executions (company_id);
CREATE INDEX IF NOT EXISTS workflow_executions_workflow_idx ON workflow_executions (workflow_id);
CREATE INDEX IF NOT EXISTS workflow_executions_status_idx ON workflow_executions (status);

-- F07: AI Core Extended - Consumption tracking, Model configs, Prompt templates, Evaluations, Cache

-- Enums
DO $$ BEGIN
    CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'google', 'cohere', 'mistral', 'groq', 'ollama');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ai_request_type AS ENUM ('completion', 'chat', 'embedding', 'image', 'audio', 'evaluation', 'moderation', 'fine_tuning');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabla de consumo de IA
CREATE TABLE IF NOT EXISTS ai_consumption (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider ai_provider NOT NULL,
    model text NOT NULL,
    request_type ai_request_type NOT NULL,
    prompt_tokens integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    estimated_cost_usd integer NOT NULL DEFAULT 0,
    prompt_hash text,
    response_hash text,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_consumption_company_idx ON ai_consumption (company_id);
CREATE INDEX IF NOT EXISTS ai_consumption_user_idx ON ai_consumption (user_id);
CREATE INDEX IF NOT EXISTS ai_consumption_provider_idx ON ai_consumption (provider);
CREATE INDEX IF NOT EXISTS ai_consumption_model_idx ON ai_consumption (model);
CREATE INDEX IF NOT EXISTS ai_consumption_type_idx ON ai_consumption (request_type);
CREATE INDEX IF NOT EXISTS ai_consumption_created_idx ON ai_consumption (created_at);

-- ConfiguraciÃ³n de modelos de IA
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider ai_provider NOT NULL,
    model text NOT NULL,
    display_name text,
    is_default boolean NOT NULL DEFAULT false,
    is_enabled boolean NOT NULL DEFAULT true,
    max_tokens integer,
    default_temperature integer DEFAULT 70,
    default_top_p integer DEFAULT 90,
    cost_per_1k_prompt_tokens integer DEFAULT 0,
    cost_per_1k_completion_tokens integer DEFAULT 0,
    max_tokens_per_request integer,
    supports_streaming boolean DEFAULT true,
    supports_tools boolean DEFAULT false,
    supports_vision boolean DEFAULT false,
    supports_json_mode boolean DEFAULT false,
    rate_limit_rpm integer DEFAULT 60,
    rate_limit_tpm integer DEFAULT 100000,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS model_configs_company_model_unique ON ai_model_configs (company_id, provider, model);
CREATE INDEX IF NOT EXISTS model_configs_company_idx ON ai_model_configs (company_id);
CREATE INDEX IF NOT EXISTS model_configs_provider_idx ON ai_model_configs (provider);

-- Plantillas de prompts
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    system_prompt text,
    user_prompt_template text NOT NULL,
    variables jsonb NOT NULL DEFAULT '[]',
    model_config_id uuid REFERENCES ai_model_configs(id) ON DELETE SET NULL,
    default_options jsonb DEFAULT '{}',
    tags jsonb DEFAULT '[]',
    is_public boolean NOT NULL DEFAULT false,
    version integer DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS prompt_templates_company_slug_unique ON ai_prompt_templates (company_id, slug);
CREATE INDEX IF NOT EXISTS prompt_templates_company_idx ON ai_prompt_templates (company_id);

-- Evaluaciones de IA
CREATE TABLE IF NOT EXISTS ai_evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    consumption_id uuid REFERENCES ai_consumption(id) ON DELETE SET NULL,
    prompt_hash text NOT NULL,
    response_hash text NOT NULL,
    evaluator_provider ai_provider NOT NULL,
    evaluator_model text NOT NULL,
    criteria jsonb NOT NULL DEFAULT '{}',
    score integer NOT NULL,
    reasoning text,
    passed boolean NOT NULL,
    meta jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS evaluations_company_idx ON ai_evaluations (company_id);
CREATE INDEX IF NOT EXISTS evaluations_consumption_idx ON ai_evaluations (consumption_id);

-- Cache de IA
CREATE TABLE IF NOT EXISTS ai_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    prompt_hash text NOT NULL,
    model text NOT NULL,
    provider ai_provider NOT NULL,
    response jsonb NOT NULL,
    tokens_used integer,
    cost_usd integer DEFAULT 0,
    hit_count integer NOT NULL DEFAULT 0,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_cache_unique ON ai_cache (company_id, prompt_hash, model, provider);
CREATE INDEX IF NOT EXISTS ai_cache_company_idx ON ai_cache (company_id);
CREATE INDEX IF NOT EXISTS ai_cache_prompt_hash_idx ON ai_cache (prompt_hash);
CREATE INDEX IF NOT EXISTS ai_cache_model_idx ON ai_cache (model);
CREATE INDEX IF NOT EXISTS ai_cache_provider_idx ON ai_cache (provider);
CREATE INDEX IF NOT EXISTS ai_cache_expires_idx ON ai_cache (expires_at);

