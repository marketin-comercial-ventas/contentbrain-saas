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

-- Índices para audience_segments
CREATE UNIQUE INDEX IF NOT EXISTS segments_audience_slug_unique ON audience_segments (audience_id, slug);
CREATE INDEX IF NOT EXISTS segments_company_idx ON audience_segments (company_id);
CREATE INDEX IF NOT EXISTS segments_audience_idx ON audience_segments (audience_id);

-- Índices para candidate_personas
CREATE UNIQUE INDEX IF NOT EXISTS candidate_personas_company_slug_unique ON candidate_personas (company_id, slug);
CREATE INDEX IF NOT EXISTS candidate_personas_company_idx ON candidate_personas (company_id);
CREATE INDEX IF NOT EXISTS candidate_personas_vacancy_idx ON candidate_personas (vacancy_id);

-- Índices para audience_scoring_rules
CREATE INDEX IF NOT EXISTS scoring_rules_company_idx ON audience_scoring_rules (company_id);
CREATE INDEX IF NOT EXISTS scoring_rules_audience_idx ON audience_scoring_rules (audience_id);
CREATE INDEX IF NOT EXISTS scoring_rules_segment_idx ON audience_scoring_rules (segment_id);
CREATE INDEX IF NOT EXISTS scoring_rules_persona_idx ON audience_scoring_rules (candidate_persona_id);

-- Índices para audience_insights
CREATE INDEX IF NOT EXISTS insights_company_idx ON audience_insights (company_id);
CREATE INDEX IF NOT EXISTS insights_audience_idx ON audience_insights (audience_id);
CREATE INDEX IF NOT EXISTS insights_segment_idx ON audience_insights (segment_id);