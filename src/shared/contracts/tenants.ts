import { z } from "zod";

export const membershipRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

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

export const membershipSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  companyId: z.uuid(),
  role: membershipRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const newMembershipSchema = membershipSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateMembershipSchema = newMembershipSchema.partial().pick({ role: true }).strict();

export const invitationSchema = z.object({
  id: z.uuid(),
  companyId: z.uuid(),
  email: z.email(),
  role: membershipRoleSchema,
  expiresAt: z.iso.datetime(),
  usedAt: z.iso.datetime().nullable().optional(),
  inviterId: z.uuid(),
  createdAt: z.iso.datetime(),
});

export const newInvitationSchema = z.object({
  companyId: z.uuid(),
  email: z.email(),
  role: membershipRoleSchema.default("member"),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(32).max(128),
});

export const companyMemberSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  companyId: z.uuid(),
  role: membershipRoleSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
  }),
});

export type Company = z.infer<typeof companySchema>;
export type NewCompany = z.infer<typeof newCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type NewMembership = z.infer<typeof newMembershipSchema>;
export type UpdateMembership = z.infer<typeof updateMembershipSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type NewInvitation = z.infer<typeof newInvitationSchema>;
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type CompanyMember = z.infer<typeof companyMemberSchema>;