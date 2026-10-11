import { describe, expect, it } from "vitest";
import {
  companySchema,
  newCompanySchema,
  updateCompanySchema,
  membershipSchema,
  newMembershipSchema,
  updateMembershipSchema,
  invitationSchema,
  newInvitationSchema,
  acceptInvitationSchema,
  companyMemberSchema,
  membershipRoleSchema,
} from "@/shared/contracts/tenants";

describe("esquemas compartidos de tenant (F02)", () => {
  describe("membershipRoleSchema", () => {
    it("acepta los cuatro roles válidos", () => {
      ["owner", "admin", "member", "viewer"].forEach((r) => {
        expect(membershipRoleSchema.safeParse(r).success).toBe(true);
      });
    });
    it("rechaza roles inválidos", () => {
      expect(membershipRoleSchema.safeParse("superadmin").success).toBe(false);
      expect(membershipRoleSchema.safeParse("").success).toBe(false);
    });
  });

  describe("companySchema / newCompanySchema / updateCompanySchema", () => {
    const validCompany = {
      id: crypto.randomUUID(),
      name: "Mi Empresa",
      slug: "mi-empresa",
      logoUrl: "https://cdn.example.com/logo.png",
      primaryColor: "#0a1628",
      secondaryColor: "#e03e52",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("acepta empresa válida", () => {
      expect(companySchema.safeParse(validCompany).success).toBe(true);
    });

    it("newCompanySchema omite id, createdAt, updatedAt", () => {
      const { id, createdAt, updatedAt, ...rest } = validCompany;
      expect(newCompanySchema.safeParse(rest).success).toBe(true);
    });

    it("updateCompanySchema permite campos parciales", () => {
      expect(updateCompanySchema.safeParse({ name: "Nuevo nombre" }).success).toBe(true);
      expect(updateCompanySchema.safeParse({ slug: "nuevo-slug" }).success).toBe(true);
    });

    it("rechaza slug inválido (mayúsculas, caracteres especiales)", () => {
      expect(newCompanySchema.safeParse({ ...validCompany, slug: "Mi-Empresa" }).success).toBe(false);
      expect(newCompanySchema.safeParse({ ...validCompany, slug: "mi_empresa" }).success).toBe(false);
    });

    it("rechaza colores hex inválidos", () => {
      expect(newCompanySchema.safeParse({ ...validCompany, primaryColor: "azul" }).success).toBe(false);
      expect(newCompanySchema.safeParse({ ...validCompany, primaryColor: "#abc" }).success).toBe(false);
    });
  });

  describe("membershipSchema / newMembershipSchema / updateMembershipSchema", () => {
    const validMembership = {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      companyId: crypto.randomUUID(),
      role: "member" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("acepta membresía válida", () => {
      expect(membershipSchema.safeParse(validMembership).success).toBe(true);
    });

    it("newMembershipSchema omite id, createdAt, updatedAt", () => {
      const { id, createdAt, updatedAt, ...rest } = validMembership;
      expect(newMembershipSchema.safeParse(rest).success).toBe(true);
    });

    it("updateMembershipSchema solo permite actualizar role", () => {
      expect(updateMembershipSchema.safeParse({ role: "admin" }).success).toBe(true);
      expect(updateMembershipSchema.safeParse({ userId: crypto.randomUUID() }).success).toBe(false);
    });
  });

  describe("invitationSchema / newInvitationSchema / acceptInvitationSchema", () => {
    const validInvitation = {
      id: crypto.randomUUID(),
      companyId: crypto.randomUUID(),
      email: "usuario@ejemplo.com",
      role: "member" as const,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
      inviterId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    it("acepta invitación válida", () => {
      expect(invitationSchema.safeParse(validInvitation).success).toBe(true);
    });

    it("newInvitationSchema solo requiere companyId, email y role opcional", () => {
      expect(newInvitationSchema.safeParse({ companyId: validInvitation.companyId, email: "nuevo@ejemplo.com" }).success).toBe(true);
      expect(newInvitationSchema.safeParse({ companyId: validInvitation.companyId, email: "nuevo@ejemplo.com", role: "admin" }).success).toBe(true);
    });

    it("newInvitationSchema por defecto usa role 'member'", () => {
      const parsed = newInvitationSchema.parse({ companyId: validInvitation.companyId, email: "nuevo@ejemplo.com" });
      expect(parsed.role).toBe("member");
    });

    it("acceptInvitationSchema exige token de longitud adecuada", () => {
      expect(acceptInvitationSchema.safeParse({ token: "a".repeat(32) }).success).toBe(true);
      expect(acceptInvitationSchema.safeParse({ token: "corto" }).success).toBe(false);
      expect(acceptInvitationSchema.safeParse({ token: "a".repeat(129) }).success).toBe(false);
    });

    it("rechaza email inválido en invitación", () => {
      expect(newInvitationSchema.safeParse({ companyId: validInvitation.companyId, email: "no-es-email" }).success).toBe(false);
    });
  });

  describe("companyMemberSchema", () => {
    const validMember = {
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      companyId: crypto.randomUUID(),
      role: "viewer" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: crypto.randomUUID(),
        name: "Usuario Prueba",
        email: "usuario@ejemplo.com",
      },
    };

    it("acepta miembro de empresa válido", () => {
      expect(companyMemberSchema.safeParse(validMember).success).toBe(true);
    });

    it("rechaza email inválido en user", () => {
      expect(companyMemberSchema.safeParse({ ...validMember, user: { ...validMember.user, email: "mal" } }).success).toBe(false);
    });
  });
});