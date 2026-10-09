import { z } from "zod";

export const companySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newCompanySchema = companySchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateCompanySchema = newCompanySchema.partial();

export const membershipRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

export const membershipSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  companyId: z.uuid(),
  role: membershipRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newMembershipSchema = membershipSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateMembershipSchema = newMembershipSchema.partial();

export const companyBrainSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  industry: z.string().max(200).optional().nullable(),
  valueProposition: z.string().max(5000).optional().nullable(),
  targetAudience: z.string().max(5000).optional().nullable(),
  tone: z.string().max(100).default("profesional"),
  website: z.string().url().optional().nullable(),
  whatsapp: z.string().max(50).optional().nullable(),
  socialLinkedin: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialFacebook: z.string().url().optional().nullable(),
  socialTiktok: z.string().url().optional().nullable(),
  products: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newCompanyBrainSchema = companyBrainSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateCompanyBrainSchema = newCompanyBrainSchema.partial();

export const productCategorySchema = z.enum(["producto", "servicio", "curso", "suscripcion", "otro"]);
export const productStatusSchema = z.enum(["draft", "active", "archived", "discontinued"]);

/**
 * Public product contract. `price` is the canonical API/UI name; the
 * persistence mapping is handled by the Drizzle schema/service.
 */
export const productSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).nullable().optional(),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(1000).optional().nullable(),
  category: productCategorySchema.default("producto"),
  price: z.number().int().min(0).default(0),
  /** Legacy input alias; responses and UI use `price`. */
  basePrice: z.number().int().min(0).optional(),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  costPrice: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).default("USD"),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  weight: z.number().int().min(0).optional().nullable(),
  dimensions: z.unknown().optional().nullable(),
  benefits: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.unknown().optional().nullable(),
  tags: z.array(z.string()).default([]),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(5000).optional().nullable(),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  digitalFileUrl: z.string().url().optional().nullable(),
  requiresShipping: z.boolean().default(true),
  taxable: z.boolean().default(true),
  taxClass: z.string().max(100).optional().nullable(),
  trackInventory: z.boolean().default(true),
  inventoryQuantity: z.number().int().default(0),
  lowStockThreshold: z.number().int().min(0).optional().nullable(),
  allowBackorder: z.boolean().default(false),
  meta: z.unknown().optional().nullable(),
  status: productStatusSchema.default("draft"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

// Input keeps price optional so the legacy `basePrice` alias can be used
// without being overwritten by the output default of zero.
export const newProductSchema = productSchema
  .omit({ id: true, companyId: true, createdAt: true, updatedAt: true })
  .extend({ price: z.number().int().min(0).optional() });
export const updateProductSchema = newProductSchema.partial();

export const audienceSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  avatarName: z.string().max(100).optional().nullable(),
  demographics: z.record(z.string(), z.unknown()).default({}),
  needs: z.array(z.string()).default([]),
  pains: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  tone: z.string().max(100).default("profesional"),
  cta: z.string().max(500).optional().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newAudienceSchema = audienceSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateAudienceSchema = newAudienceSchema.partial();

export const generateAudienceSchema = z.object({
  companyBrainId: z.uuid(),
  productId: z.uuid().optional(),
  brief: z.string().min(10).max(5000),
});

export const contentTypeSchema = z.enum(["post", "ad", "script", "email", "story", "reel", "article", "hook", "cta", "hashtags"]);

export const generatedContentSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  productId: z.uuid().nullable().optional(),
  audienceId: z.uuid().nullable().optional(),
  campaignId: z.uuid().nullable().optional(),
  type: contentTypeSchema,
  prompt: z.string(),
  input: z.record(z.string(), z.unknown()).default({}),
  output: z.record(z.string(), z.unknown()).default({}),
  variants: z.array(z.record(z.string(), z.unknown())).default([]),
  model: z.string().default("gpt-4o-mini"),
  tokensUsed: z.number().int().optional().nullable(),
  status: z.string().default("completed"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newGeneratedContentSchema = generatedContentSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const campaignChannelSchema = z.enum(["facebook", "instagram", "linkedin", "twitter", "tiktok", "email", "whatsapp", "web", "otro"]);
export const campaignStatusSchema = z.enum(["draft", "active", "paused", "completed", "archived"]);

export const campaignSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  name: z.string().min(1).max(200),
  objective: z.string().max(5000).optional().nullable(),
  productId: z.uuid().nullable().optional(),
  audienceId: z.uuid().nullable().optional(),
  channel: campaignChannelSchema.default("web"),
  startDate: z.iso.datetime().nullable().optional(),
  endDate: z.iso.datetime().nullable().optional(),
  status: campaignStatusSchema.default("draft"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newCampaignSchema = campaignSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateCampaignSchema = newCampaignSchema.partial();

export const leadSourceSchema = z.enum(["website", "facebook", "instagram", "linkedin", "referral", "cold_call", "email", "event", "ads", "organic", "otro"]);
export const leadStatusSchema = z.enum(["nuevo", "contactado", "calificado", "propuesta", "ganado", "perdido"]);

export const leadSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  campaignId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  source: leadSourceSchema.default("organic"),
  status: leadStatusSchema.default("nuevo"),
  assignedTo: z.uuid().nullable().optional(),
  notes: z.string().max(10000).optional().nullable(),
  value: z.number().int().min(0).default(0),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newLeadSchema = leadSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateLeadSchema = newLeadSchema.partial();
export const moveLeadSchema = z.object({ status: leadStatusSchema });

export const jobModalitySchema = z.enum(["presencial", "hibrido", "remoto"]);
export const jobStatusSchema = z.enum(["draft", "published", "paused", "closed", "filled"]);
export const candidateStatusSchema = z.enum(["nuevo", "preseleccion", "contacto", "entrevista", "finalista", "oferta", "contratado", "rechazado"]);

export const vacancySchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  modality: jobModalitySchema.default("hibrido"),
  salaryMin: z.number().int().min(0).optional().nullable(),
  salaryMax: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).default("USD"),
  requirements: z.array(z.string()).default([]),
  status: jobStatusSchema.default("draft"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newVacancySchema = vacancySchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateVacancySchema = newVacancySchema.partial();

export const candidateSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  vacancyId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  cvUrl: z.string().url().optional().nullable(),
  experience: z.string().max(5000).optional().nullable(),
  skills: z.array(z.string()).default([]),
  source: z.string().max(100).default("direct"),
  status: candidateStatusSchema.default("nuevo"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newCandidateSchema = candidateSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateCandidateSchema = newCandidateSchema.partial();
export const moveCandidateSchema = z.object({ status: candidateStatusSchema });

/* ===================== F03 Company Brain Extended ===================== */

export const brandTypeSchema = z.enum(["principal", "secundaria", "producto", "servicio", "franquicia"]);

export const brandSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  type: brandTypeSchema.default("principal"),
  isActive: z.boolean().default(true),
  website: z.string().url().optional().nullable(),
  socialLinkedin: z.string().url().optional().nullable(),
  socialInstagram: z.string().url().optional().nullable(),
  socialTwitter: z.string().url().optional().nullable(),
  socialFacebook: z.string().url().optional().nullable(),
  socialTiktok: z.string().url().optional().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newBrandSchema = brandSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateBrandSchema = newBrandSchema.partial();

export const branchTypeSchema = z.enum(["sede", "sucursal", "oficina", "almacen", "punto_venta", "otro"]);

export const branchSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  brandId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  type: branchTypeSchema.default("sucursal"),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).default("Argentina"),
  postalCode: z.string().max(20).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isHeadquarters: z.boolean().default(false),
  openingHours: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newBranchSchema = branchSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateBranchSchema = newBranchSchema.partial();

export const profileTypeSchema = z.enum(["commercial", "talent", "hybrid"]);

export const profileSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  brandId: z.uuid().nullable().optional(),
  branchId: z.uuid().nullable().optional(),
  name: z.string().min(1).max(200),
  type: profileTypeSchema,
  description: z.string().max(5000).optional().nullable(),
  responsibleUserId: z.uuid().nullable().optional(),
  settings: z.record(z.string(), z.unknown()).default({}),
  kpis: z.record(z.string(), z.unknown()).default({}),
  isActive: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newProfileSchema = profileSchema.omit({ id: true, companyId: true, createdAt: true, updatedAt: true });
export const updateProfileSchema = newProfileSchema.partial();

export type Company = z.infer<typeof companySchema>;
export type NewCompany = z.infer<typeof newCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

export type Membership = z.infer<typeof membershipSchema>;
export type NewMembership = z.infer<typeof newMembershipSchema>;
export type UpdateMembership = z.infer<typeof updateMembershipSchema>;

export type CompanyBrain = z.infer<typeof companyBrainSchema>;
export type NewCompanyBrain = z.infer<typeof newCompanyBrainSchema>;
export type UpdateCompanyBrain = z.infer<typeof updateCompanyBrainSchema>;

export type Product = z.infer<typeof productSchema>;
export type NewProduct = z.infer<typeof newProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type Audience = z.infer<typeof audienceSchema>;
export type NewAudience = z.infer<typeof newAudienceSchema>;
export type UpdateAudience = z.infer<typeof updateAudienceSchema>;
export type GenerateAudienceInput = z.infer<typeof generateAudienceSchema>;

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
export type NewGeneratedContent = z.infer<typeof newGeneratedContentSchema>;

export type Campaign = z.infer<typeof campaignSchema>;
export type NewCampaign = z.infer<typeof newCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;

export type Lead = z.infer<typeof leadSchema>;
export type NewLead = z.infer<typeof newLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type MoveLead = z.infer<typeof moveLeadSchema>;

export type Vacancy = z.infer<typeof vacancySchema>;
export type NewVacancy = z.infer<typeof newVacancySchema>;
export type UpdateVacancy = z.infer<typeof updateVacancySchema>;

export type Candidate = z.infer<typeof candidateSchema>;
export type NewCandidate = z.infer<typeof newCandidateSchema>;
export type UpdateCandidate = z.infer<typeof updateCandidateSchema>;
export type MoveCandidate = z.infer<typeof moveCandidateSchema>;