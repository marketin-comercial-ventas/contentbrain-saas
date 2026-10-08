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

-- Índices adicionales
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