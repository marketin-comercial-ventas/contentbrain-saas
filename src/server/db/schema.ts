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
  // `slug` was added after the original catalog migration and is nullable
  // for legacy rows; the service derives it for new products.
  slug: text("slug"),
  description: text("description"),
  shortDescription: text("short_description"),
  category: productCategoryEnum("category").notNull().default("producto"),
  status: productStatusEnum("status").notNull().default("draft"),
  // `price` is the canonical application field and maps to the newer
  // base_price column. `legacyPrice` keeps the original price column during
  // the compatibility window so existing values are never discarded.
  price: integer("base_price").notNull().default(0),
  legacyPrice: integer("price").notNull().default(0),
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

/* ===================== F05 Audiencias Avanzadas ===================== */

export const segmentTypeEnum = pgEnum("segment_type", ["demographic", "behavioral", "psychographic", "firmographic", "technographic", "custom"]);

export const segmentStatusEnum = pgEnum("segment_status", ["draft", "active", "archived"]);

export const audienceSegments = pgTable("audience_segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  audienceId: uuid("audience_id")
    .notNull()
    .references(() => audiences.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  type: segmentTypeEnum("type").notNull(),
  status: segmentStatusEnum("status").notNull().default("draft"),
  criteria: jsonb("criteria").notNull().default({}),
  estimatedSize: integer("estimated_size"),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("segments_company_idx").on(t.companyId),
  audienceIdx: index("segments_audience_idx").on(t.audienceId),
  audienceSlugUnique: uniqueIndex("segments_audience_slug_unique").on(t.audienceId, t.slug),
}));

export type AudienceSegment = typeof audienceSegments.$inferSelect;
export type NewAudienceSegment = typeof audienceSegments.$inferInsert;

export const candidatePersonaStatusEnum = pgEnum("candidate_persona_status", ["draft", "active", "archived"]);

export const candidatePersonas = pgTable("candidate_personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  vacancyId: uuid("vacancy_id").references(() => vacancies.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  demographics: jsonb("demographics").notNull().default({}),
  skills: jsonb("skills").notNull().default([]),
  experience: jsonb("experience").notNull().default({}),
  motivations: jsonb("motivations").notNull().default([]),
  painPoints: jsonb("pain_points").notNull().default([]),
  preferredChannels: jsonb("preferred_channels").notNull().default([]),
  salaryExpectations: jsonb("salary_expectations").default({}),
  locationPreferences: jsonb("location_preferences").default({}),
  workStyle: jsonb("work_style").default({}),
  culturalFit: jsonb("cultural_fit").default({}),
  redFlags: jsonb("red_flags").default([]),
  greenFlags: jsonb("green_flags").default([]),
  scoreWeights: jsonb("score_weights").default({}),
  status: candidatePersonaStatusEnum("status").notNull().default("draft"),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("candidate_personas_company_idx").on(t.companyId),
  vacancyIdx: index("candidate_personas_vacancy_idx").on(t.vacancyId),
  companySlugUnique: uniqueIndex("candidate_personas_company_slug_unique").on(t.companyId, t.slug),
}));

export type CandidatePersona = typeof candidatePersonas.$inferSelect;
export type NewCandidatePersona = typeof candidatePersonas.$inferInsert;

export const audienceScoringRules = pgTable("audience_scoring_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  audienceId: uuid("audience_id")
    .references(() => audiences.id, { onDelete: "cascade" }),
  segmentId: uuid("segment_id").references(() => audienceSegments.id, { onDelete: "cascade" }),
  candidatePersonaId: uuid("candidate_persona_id").references(() => candidatePersonas.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull().default({}),
  weight: integer("weight").notNull().default(1),
  operator: text("operator").notNull().default("add"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("scoring_rules_company_idx").on(t.companyId),
  audienceIdx: index("scoring_rules_audience_idx").on(t.audienceId),
  segmentIdx: index("scoring_rules_segment_idx").on(t.segmentId),
  personaIdx: index("scoring_rules_persona_idx").on(t.candidatePersonaId),
}));

export type AudienceScoringRule = typeof audienceScoringRules.$inferSelect;
export type NewAudienceScoringRule = typeof audienceScoringRules.$inferInsert;

export const audienceInsights = pgTable("audience_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  audienceId: uuid("audience_id")
    .notNull()
    .references(() => audiences.id, { onDelete: "cascade" }),
  segmentId: uuid("segment_id").references(() => audienceSegments.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  data: jsonb("data").notNull().default({}),
  confidence: integer("confidence").default(0),
  source: text("source").default("ai"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("insights_company_idx").on(t.companyId),
  audienceIdx: index("insights_audience_idx").on(t.audienceId),
  segmentIdx: index("insights_segment_idx").on(t.segmentId),
}));

export type AudienceInsight = typeof audienceInsights.$inferSelect;
export type NewAudienceInsight = typeof audienceInsights.$inferInsert;

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

/* ===================== F06 Rules Engine ===================== */

export const ruleTriggerEnum = pgEnum("rule_trigger", ["manual", "scheduled", "event", "webhook", "api", "cron"]);

export const ruleStatusEnum = pgEnum("rule_status", ["draft", "active", "paused", "archived", "error"]);

export const actionTypeEnum = pgEnum("action_type", ["notification", "email", "webhook", "api_call", "create_record", "update_record", "delete_record", "assign_task", "send_message", "generate_content", "run_workflow", "custom"]);

export const conditionOperatorEnum = pgEnum("condition_operator", ["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "greater_equal", "less_equal", "in", "not_in", "exists", "not_exists", "matches_regex", "is_empty", "is_not_empty"]);

export const rules = pgTable("rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  trigger: ruleTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").notNull().default({}),
  status: ruleStatusEnum("status").notNull().default("draft"),
  priority: integer("priority").default(0),
  conditions: jsonb("conditions").notNull().default({}),
  actions: jsonb("actions").notNull().default([]),
  executionCount: integer("execution_count").notNull().default(0),
  lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),
  lastExecutionStatus: text("last_execution_status"),
  lastExecutionError: text("last_execution_error"),
  executionTimeoutMs: integer("execution_timeout_ms").default(30000),
  maxRetries: integer("max_retries").default(3),
  retryDelayMs: integer("retry_delay_ms").default(1000),
  tags: jsonb("tags").default([]),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("rules_company_idx").on(t.companyId),
  companySlugUnique: uniqueIndex("rules_company_slug_unique").on(t.companyId, t.slug),
  statusIdx: index("rules_status_idx").on(t.status),
  triggerIdx: index("rules_trigger_idx").on(t.trigger),
}));

export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;

export const ruleExecutions = pgTable("rule_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  ruleId: uuid("rule_id")
    .notNull()
    .references(() => rules.id, { onDelete: "cascade" }),
  triggerData: jsonb("trigger_data").notNull().default({}),
  context: jsonb("context").notNull().default({}),
  status: text("status").notNull().default("pending"),
  result: jsonb("result").default({}),
  error: text("error"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationMs: integer("duration_ms"),
  retryCount: integer("retry_count").default(0),
  meta: jsonb("meta").default({}),
}, (t) => ({
  companyIdx: index("executions_company_idx").on(t.companyId),
  ruleIdx: index("executions_rule_idx").on(t.ruleId),
  statusIdx: index("executions_status_idx").on(t.status),
  startedIdx: index("executions_started_idx").on(t.startedAt),
}));

export type RuleExecution = typeof ruleExecutions.$inferSelect;
export type NewRuleExecution = typeof ruleExecutions.$inferInsert;

export const ruleTemplates = pgTable("rule_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  category: text("category"),
  trigger: ruleTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").notNull().default({}),
  conditions: jsonb("conditions").notNull().default({}),
  actions: jsonb("actions").notNull().default([]),
  isPublic: boolean("is_public").notNull().default(false),
  tags: jsonb("tags").default([]),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("templates_company_idx").on(t.companyId),
  companySlugUnique: uniqueIndex("templates_company_slug_unique").on(t.companyId, t.slug),
  isPublicIdx: index("templates_public_idx").on(t.isPublic),
}));

export type RuleTemplate = typeof ruleTemplates.$inferSelect;
export type NewRuleTemplate = typeof ruleTemplates.$inferInsert;

export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  variables: jsonb("variables").default({}),
  settings: jsonb("settings").default({}),
  version: integer("version").default(1),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("workflows_company_idx").on(t.companyId),
  companySlugUnique: uniqueIndex("workflows_company_slug_unique").on(t.companyId, t.slug),
  statusIdx: index("workflows_status_idx").on(t.status),
}));

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export const workflowExecutions = pgTable("workflow_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  inputData: jsonb("input_data").notNull().default({}),
  status: text("status").notNull().default("pending"),
  currentNodeId: text("current_node_id"),
  result: jsonb("result").default({}),
  error: text("error"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationMs: integer("duration_ms"),
  meta: jsonb("meta").default({}),
}, (t) => ({
  companyIdx: index("workflow_executions_company_idx").on(t.companyId),
  workflowIdx: index("workflow_executions_workflow_idx").on(t.workflowId),
  statusIdx: index("workflow_executions_status_idx").on(t.status),
}));

export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;

/* ===================== Fin Rules Engine ===================== */

/* ===================== F07 AI Core Extended ===================== */

export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic", "google", "cohere", "mistral", "groq", "ollama"]);

export const aiRequestTypeEnum = pgEnum("ai_request_type", ["completion", "chat", "embedding", "image", "audio", "evaluation", "moderation", "fine_tuning"]);

export const aiConsumption = pgTable("ai_consumption", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: aiProviderEnum("provider").notNull(),
  model: text("model").notNull(),
  requestType: aiRequestTypeEnum("request_type").notNull(),
  promptTokens: integer("prompt_tokens").notNull().default(0),
  completionTokens: integer("completion_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  estimatedCostUsd: integer("estimated_cost_usd").notNull().default(0),
  promptHash: text("prompt_hash"),
  responseHash: text("response_hash"),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("ai_consumption_company_idx").on(t.companyId),
  userIdx: index("ai_consumption_user_idx").on(t.userId),
  providerIdx: index("ai_consumption_provider_idx").on(t.provider),
  modelIdx: index("ai_consumption_model_idx").on(t.model),
  typeIdx: index("ai_consumption_type_idx").on(t.requestType),
  createdIdx: index("ai_consumption_created_idx").on(t.createdAt),
}));

export type AIConsumption = typeof aiConsumption.$inferSelect;
export type NewAIConsumption = typeof aiConsumption.$inferInsert;

export const aiModelConfigs = pgTable("ai_model_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  provider: aiProviderEnum("provider").notNull(),
  model: text("model").notNull(),
  displayName: text("display_name"),
  isDefault: boolean("is_default").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(true),
  maxTokens: integer("max_tokens"),
  defaultTemperature: integer("default_temperature").default(70), // 0.7 * 100
  defaultTopP: integer("default_top_p").default(90), // 0.9 * 100
  costPer1kPromptTokens: integer("cost_per_1k_prompt_tokens").default(0),
  costPer1kCompletionTokens: integer("cost_per_1k_completion_tokens").default(0),
  maxTokensPerRequest: integer("max_tokens_per_request"),
  supportsStreaming: boolean("supports_streaming").default(true),
  supportsTools: boolean("supports_tools").default(false),
  supportsVision: boolean("supports_vision").default(false),
  supportsJsonMode: boolean("supports_json_mode").default(false),
  rateLimitRpm: integer("rate_limit_rpm").default(60),
  rateLimitTpm: integer("rate_limit_tpm").default(100000),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("model_configs_company_idx").on(t.companyId),
  providerIdx: index("model_configs_provider_idx").on(t.provider),
  companyModelUnique: uniqueIndex("model_configs_company_model_unique").on(t.companyId, t.provider, t.model),
}));

export type AIModelConfig = typeof aiModelConfigs.$inferSelect;
export type NewAIModelConfig = typeof aiModelConfigs.$inferInsert;

export const aiPromptTemplates = pgTable("ai_prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt"),
  userPromptTemplate: text("user_prompt_template").notNull(),
  variables: jsonb("variables").notNull().default([]),
  modelConfigId: uuid("model_config_id").references(() => aiModelConfigs.id, { onDelete: "set null" }),
  defaultOptions: jsonb("default_options").default({}),
  tags: jsonb("tags").default([]),
  isPublic: boolean("is_public").notNull().default(false),
  version: integer("version").default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("prompt_templates_company_idx").on(t.companyId),
  companySlugUnique: uniqueIndex("prompt_templates_company_slug_unique").on(t.companyId, t.slug),
}));

export type AIPromptTemplate = typeof aiPromptTemplates.$inferSelect;
export type NewAIPromptTemplate = typeof aiPromptTemplates.$inferInsert;

export const aiEvaluations = pgTable("ai_evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  consumptionId: uuid("consumption_id").references(() => aiConsumption.id, { onDelete: "set null" }),
  promptHash: text("prompt_hash").notNull(),
  responseHash: text("response_hash").notNull(),
  evaluatorProvider: aiProviderEnum("evaluator_provider").notNull(),
  evaluatorModel: text("evaluator_model").notNull(),
  criteria: jsonb("criteria").notNull().default({}),
  score: integer("score").notNull(),
  reasoning: text("reasoning"),
  passed: boolean("passed").notNull(),
  meta: jsonb("meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("evaluations_company_idx").on(t.companyId),
  consumptionIdx: index("evaluations_consumption_idx").on(t.consumptionId),
}));

export type AIEvaluation = typeof aiEvaluations.$inferSelect;
export type NewAIEvaluation = typeof aiEvaluations.$inferInsert;

export const aiCache = pgTable("ai_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  promptHash: text("prompt_hash").notNull(),
  model: text("model").notNull(),
  provider: aiProviderEnum("provider").notNull(),
  response: jsonb("response").notNull(),
  tokensUsed: integer("tokens_used"),
  costUsd: integer("cost_usd").default(0),
  hitCount: integer("hit_count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => ({
  companyIdx: index("ai_cache_company_idx").on(t.companyId),
  promptHashIdx: index("ai_cache_prompt_hash_idx").on(t.promptHash),
  modelIdx: index("ai_cache_model_idx").on(t.model),
  providerIdx: index("ai_cache_provider_idx").on(t.provider),
  expiresIdx: index("ai_cache_expires_idx").on(t.expiresAt),
  uniqueCache: uniqueIndex("ai_cache_unique").on(t.companyId, t.promptHash, t.model, t.provider),
}));

export type AICache = typeof aiCache.$inferSelect;
export type NewAICache = typeof aiCache.$inferInsert;

/* ===================== Fin F07 AI Core Extended ===================== */