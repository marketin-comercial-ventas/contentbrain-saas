import { timestamp, uuid, jsonb, pgTable, text, integer, boolean, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";

/**
 * Catálogo global de plataforma (sin tenant_id). Enumerado en
 * docs/DATA_MODEL.md. Existe desde F00 para validar el pipeline de
 * migraciones; no contiene datos de negocio multiempresa.
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

/**
 * F01 Identity: identidad global de usuario (sin tenant_id; la membresía
 * por empresa llega en F02). Enumerado en docs/DATA_MODEL.md.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/** Sesiones de usuario; el token solo se guarda hasheado (SHA-256). */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export type Session = typeof sessions.$inferSelect;

/** Tokens de recuperación de contraseña: un solo uso y con caducidad. */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

/** Trazabilidad de autenticación (globales hasta F02). */
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  event: text("event").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AuditEvent = typeof auditEvents.$inferSelect;

/* ===================== F02 Multi-Tenant base ===================== */

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#1e40af"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export const membershipRoleEnum = pgEnum("membership_role", ["owner", "admin", "member", "viewer"]);

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  role: membershipRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  userCompanyUnique: uniqueIndex("memberships_user_company_unique").on(t.userId, t.companyId),
  companyIdx: index("memberships_company_idx").on(t.companyId),
}));

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;

/* ===================== Company Brain ===================== */

export const companyBrain = pgTable("company_brain", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry"),
  valueProposition: text("value_proposition"),
  targetAudience: text("target_audience"),
  tone: text("tone").default("profesional"),
  website: text("website"),
  whatsapp: text("whatsapp"),
  socialLinkedin: text("social_linkedin"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialFacebook: text("social_facebook"),
  socialTiktok: text("social_tiktok"),
  products: jsonb("products").notNull().default([]),
  services: jsonb("services").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CompanyBrain = typeof companyBrain.$inferSelect;
export type NewCompanyBrain = typeof companyBrain.$inferInsert;

/* ===================== F04 Catálogo Avanzado ===================== */

export const productStatusEnum = pgEnum("product_status", ["draft", "active", "archived", "discontinued"]);

export const productCategoryEnum = pgEnum("product_category", ["producto", "servicio", "curso", "suscripcion", "otro"]);

export const offerTypeEnum = pgEnum("offer_type", ["percentage", "fixed_amount", "buy_x_get_y", "free_shipping", "bundle", "loyalty"]);

export const offerStatusEnum = pgEnum("offer_status", ["draft", "scheduled", "active", "paused", "expired", "cancelled"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  category: productCategoryEnum("category").notNull().default("producto"),
  status: productStatusEnum("status").notNull().default("draft"),
  basePrice: integer("base_price").notNull().default(0),
  compareAtPrice: integer("compare_at_price"),
  costPrice: integer("cost_price"),
  currency: text("currency").notNull().default("USD"),
  sku: text("sku"),
  barcode: text("barcode"),
  weight: integer("weight"),
  dimensions: jsonb("dimensions").default({}),
  benefits: jsonb("benefits").notNull().default([]),
  features: jsonb("features").notNull().default([]),
  specifications: jsonb("specifications").default({}),
  tags: jsonb("tags").default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  images: jsonb("images").default([]),
  videos: jsonb("videos").default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  isDigital: boolean("is_digital").notNull().default(false),
  digitalFileUrl: text("digital_file_url"),
  requiresShipping: boolean("requires_shipping").notNull().default(true),
  taxable: boolean("taxable").notNull().default(true),
  taxClass: text("tax_class"),
  trackInventory: boolean("track_inventory").notNull().default(true),
  inventoryQuantity: integer("inventory_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  allowBackorder: boolean("allow_backorder").notNull().default(false),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("products_company_idx").on(t.companyId),
  brandIdx: index("products_brand_idx").on(t.brandId),
  categoryIdx: index("products_category_idx").on(t.categoryId),
  slugUnique: uniqueIndex("products_company_slug_unique").on(t.companyId, t.slug),
  skuUnique: uniqueIndex("products_company_sku_unique").on(t.companyId, t.sku),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  image: text("image"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("categories_company_idx").on(t.companyId),
  parentIdx: index("categories_parent_idx").on(t.parentId),
  companySlugUnique: uniqueIndex("categories_company_slug_unique").on(t.companyId, t.slug),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: integer("price"),
  compareAtPrice: integer("compare_at_price"),
  costPrice: integer("cost_price"),
  weight: integer("weight"),
  dimensions: jsonb("dimensions").default({}),
  inventoryQuantity: integer("inventory_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(10),
  optionValues: jsonb("option_values").notNull().default({}),
  position: integer("position").default(0),
  isActive: boolean("is_active").notNull().default(true),
  image: text("image"),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  productIdx: index("variants_product_idx").on(t.productId),
  skuUnique: uniqueIndex("variants_company_sku_unique").on(t.productId, t.sku),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export const productOptions = pgTable("product_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("select"),
  position: integer("position").default(0),
  values: jsonb("values").notNull().default([]),
  isRequired: boolean("is_required").notNull().default(false),
}, (t) => ({
  productIdx: index("options_product_idx").on(t.productId),
}));

export type ProductOption = typeof productOptions.$inferSelect;
export type NewProductOption = typeof productOptions.$inferInsert;

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  type: offerTypeEnum("type").notNull(),
  value: integer("value").notNull(),
  minPurchaseAmount: integer("min_purchase_amount"),
  maxDiscountAmount: integer("max_discount_amount"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  usageLimitPerCustomer: integer("usage_limit_per_customer"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  status: offerStatusEnum("status").notNull().default("draft"),
  appliesTo: jsonb("applies_to").default({}),
  conditions: jsonb("conditions").default({}),
  couponCode: text("coupon_code"),
  isAutoApply: boolean("is_auto_apply").notNull().default(false),
  priority: integer("priority").default(0),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("offers_company_idx").on(t.companyId),
  slugUnique: uniqueIndex("offers_company_slug_unique").on(t.companyId, t.slug),
  couponUnique: uniqueIndex("offers_company_coupon_unique").on(t.companyId, t.couponCode),
}));

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

export const offerProducts = pgTable("offer_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  offerId: uuid("offer_id")
    .notNull()
    .references(() => offers.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
}, (t) => ({
  offerIdx: index("offer_products_offer_idx").on(t.offerId),
  productIdx: index("offer_products_product_idx").on(t.productId),
  unique: uniqueIndex("offer_products_unique").on(t.offerId, t.productId),
}));

export type OfferProduct = typeof offerProducts.$inferSelect;
export type NewOfferProduct = typeof offerProducts.$inferInsert;

export const priceTiers = pgTable("price_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"),
  price: integer("price").notNull(),
  isActive: boolean("is_active").notNull().default(true),
}, (t) => ({
  productIdx: index("price_tiers_product_idx").on(t.productId),
}));

export type PriceTier = typeof priceTiers.$inferSelect;
export type NewPriceTier = typeof priceTiers.$inferInsert;

/* ===================== Audiencias ===================== */

export const audiences = pgTable("audiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  avatarName: text("avatar_name"),
  demographics: jsonb("demographics").notNull().default({}),
  needs: jsonb("needs").notNull().default([]),
  pains: jsonb("pains").notNull().default([]),
  motivations: jsonb("motivations").notNull().default([]),
  objections: jsonb("objections").notNull().default([]),
  tone: text("tone").default("profesional"),
  cta: text("cta"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("audiences_company_idx").on(t.companyId),
}));

export type Audience = typeof audiences.$inferSelect;
export type NewAudience = typeof audiences.$inferInsert;

/* ===================== AI Core / Generación de contenido ===================== */

export const contentTypeEnum = pgEnum("content_type", ["post", "ad", "script", "email", "story", "reel", "article", "hook", "cta", "hashtags"]);

export const generatedContent = pgTable("generated_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  audienceId: uuid("audience_id").references(() => audiences.id, { onDelete: "set null" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  type: contentTypeEnum("type").notNull(),
  prompt: text("prompt").notNull(),
  input: jsonb("input").notNull().default({}),
  output: jsonb("output").notNull().default({}),
  variants: jsonb("variants").notNull().default([]),
  model: text("model").notNull().default("gpt-4o-mini"),
  tokensUsed: integer("tokens_used"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("generated_content_company_idx").on(t.companyId),
  productIdx: index("generated_content_product_idx").on(t.productId),
  audienceIdx: index("generated_content_audience_idx").on(t.audienceId),
  campaignIdx: index("generated_content_campaign_idx").on(t.campaignId),
}));

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type NewGeneratedContent = typeof generatedContent.$inferInsert;

/* ===================== Campañas ===================== */

export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed", "archived"]);
export const campaignChannelEnum = pgEnum("campaign_channel", ["facebook", "instagram", "linkedin", "twitter", "tiktok", "email", "whatsapp", "web", "otro"]);

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  objective: text("objective"),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  audienceId: uuid("audience_id").references(() => audiences.id, { onDelete: "set null" }),
  channel: campaignChannelEnum("channel").notNull().default("web"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  status: campaignStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("campaigns_company_idx").on(t.companyId),
}));

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

/* ===================== Leads / CRM ===================== */

export const leadSourceEnum = pgEnum("lead_source", ["website", "facebook", "instagram", "linkedin", "referral", "cold_call", "email", "event", "ads", "organic", "otro"]);
export const leadStatusEnum = pgEnum("lead_status", ["nuevo", "contactado", "calificado", "propuesta", "ganado", "perdido"]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  company: text("company"),
  source: leadSourceEnum("source").notNull().default("organic"),
  status: leadStatusEnum("status").notNull().default("nuevo"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"),
  value: integer("value").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("leads_company_idx").on(t.companyId),
  campaignIdx: index("leads_campaign_idx").on(t.campaignId),
  statusIdx: index("leads_status_idx").on(t.status),
  assignedIdx: index("leads_assigned_idx").on(t.assignedTo),
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

/* ===================== Talent / ATS ===================== */

export const jobModalityEnum = pgEnum("job_modality", ["presencial", "hibrido", "remoto"]);
export const jobStatusEnum = pgEnum("job_status", ["draft", "published", "paused", "closed", "filled"]);
export const candidateStatusEnum = pgEnum("candidate_status", ["nuevo", "preseleccion", "contacto", "entrevista", "finalista", "oferta", "contratado", "rechazado"]);

export const vacancies = pgTable("vacancies", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  modality: jobModalityEnum("modality").notNull().default("hibrido"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency").notNull().default("USD"),
  requirements: jsonb("requirements").notNull().default([]),
  status: jobStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("vacancies_company_idx").on(t.companyId),
  statusIdx: index("vacancies_status_idx").on(t.status),
}));

export type Vacancy = typeof vacancies.$inferSelect;
export type NewVacancy = typeof vacancies.$inferInsert;

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  vacancyId: uuid("vacancy_id").references(() => vacancies.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  cvUrl: text("cv_url"),
  experience: text("experience"),
  skills: jsonb("skills").notNull().default([]),
  source: text("source").default("direct"),
  status: candidateStatusEnum("status").notNull().default("nuevo"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("candidates_company_idx").on(t.companyId),
  vacancyIdx: index("candidates_vacancy_idx").on(t.vacancyId),
  statusIdx: index("candidates_status_idx").on(t.status),
}));

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;

/* ===================== F03 Company Brain Extended ===================== */

export const brandTypeEnum = pgEnum("brand_type", ["principal", "secundaria", "producto", "servicio", "franquicia"]);

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#1e40af"),
  type: brandTypeEnum("type").notNull().default("principal"),
  isActive: boolean("is_active").notNull().default(true),
  website: text("website"),
  socialLinkedin: text("social_linkedin"),
  socialInstagram: text("social_instagram"),
  socialTwitter: text("social_twitter"),
  socialFacebook: text("social_facebook"),
  socialTiktok: text("social_tiktok"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("brands_company_idx").on(t.companyId),
  companySlugUnique: uniqueIndex("brands_company_slug_unique").on(t.companyId, t.slug),
}));

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

export const branchTypeEnum = pgEnum("branch_type", ["sede", "sucursal", "oficina", "almacen", "punto_venta", "otro"]);

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  code: text("code").notNull(),
  type: branchTypeEnum("type").notNull().default("sucursal"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country").default("Argentina"),
  postalCode: text("postal_code"),
  phone: text("phone"),
  email: text("email"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isActive: boolean("is_active").notNull().default(true),
  isHeadquarters: boolean("is_headquarters").notNull().default(false),
  openingHours: jsonb("opening_hours").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("branches_company_idx").on(t.companyId),
  brandIdx: index("branches_brand_idx").on(t.brandId),
  companyCodeUnique: uniqueIndex("branches_company_code_unique").on(t.companyId, t.code),
}));

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export const profileTypeEnum = pgEnum("profile_type", ["commercial", "talent", "hybrid"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "set null" }),
  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  type: profileTypeEnum("type").notNull(),
  description: text("description"),
  responsibleUserId: uuid("responsible_user_id").references(() => users.id, { onDelete: "set null" }),
  settings: jsonb("settings").notNull().default({}),
  kpis: jsonb("kpis").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("profiles_company_idx").on(t.companyId),
  brandIdx: index("profiles_brand_idx").on(t.brandId),
  branchIdx: index("profiles_branch_idx").on(t.branchId),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;