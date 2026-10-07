-- F02: RLS Policies para multi-tenant isolation
-- Habilita RLS en todas las tablas con company_id y crea policies basadas en session variable

-- Función helper para obtener company_id actual de la sesión
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

-- Función helper para obtener user_id actual de la sesión
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

-- Función para verificar si usuario es miembro de la empresa
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

-- Función para verificar permisos
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
  
  -- Jerarquía: owner=4, admin=3, member=2, viewer=1
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
-- GRANTS PARA ROLES DE APLICACIÓN
-- =============================================

-- Crear rol de aplicación si no existe
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

COMMENT ON FUNCTION current_company_id() IS 'Retorna el company_id actual desde la variable de sesión app.current_company_id';
COMMENT ON FUNCTION current_user_id() IS 'Retorna el user_id actual desde la variable de sesión app.current_user_id';
COMMENT ON FUNCTION is_company_member(uuid, uuid) IS 'Verifica si un usuario es miembro de una empresa';
COMMENT ON FUNCTION has_permission(uuid, uuid, text) IS 'Verifica si un usuario tiene al menos el rol requerido en una empresa';