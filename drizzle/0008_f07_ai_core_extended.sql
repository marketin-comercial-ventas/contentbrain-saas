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

-- Configuración de modelos de IA
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