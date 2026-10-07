-- F04: Catálogo Avanzado - Tablas de catálogo, ofertas, variantes, categorías, etc.

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

-- Categorías
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

-- Productos (versión extendida)
-- Nota: products ya existe, solo añadimos columnas nuevas si no existen
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

-- Índices y constraints nuevos
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

-- Relación oferta-producto
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

-- Índices adicionales para products
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