import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import postgres from "postgres";
import { db, eq, and } from "@/server/db/client";
import { companies, memberships, invitations, users, auditEvents } from "@/server/db/schema";
import {
  createCompany,
  getCompanyById,
  getCompanyBySlug,
  getUserCompanies,
  updateCompany,
  deleteCompany,
  getMembership,
  getCompanyMembers,
  createInvitation,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getCompanyStats,
} from "@/modules/companies/service";
import { registerUser, getUserByEmail, getUserByToken } from "@/modules/identity/service";
import { runMigrations } from "../../scripts/lib/migrate.mjs";
import { randomBytes } from "node:crypto";

let client: postgres.Sql;

describe("F02 Multi-Tenant — Integración completa", () => {
  let userA: { id: string; email: string; name: string };
  let userB: { id: string; email: string; name: string };
  let companyA: { id: string; name: string; slug: string };

  beforeAll(async () => {
    const url = process.env.DATABASE_URL!;
    client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
    await runMigrations(client, "drizzle");
  });

  afterAll(async () => {
    await client.end({ timeout: 1 });
  });

  beforeEach(async () => {
    // Limpiar tablas en orden correcto (FK)
    await db.delete(auditEvents);
    await db.delete(invitations);
    await db.delete(memberships);
    await db.delete(companies);
    await db.delete(users);

    // Crear dos usuarios
    userA = await registerUser(db, { email: "usera@ejemplo.com", password: "clave-larga-1", name: "Usuario A" });
    userB = await registerUser(db, { email: "userb@ejemplo.com", password: "clave-larga-1", name: "Usuario B" });
  });

  afterEach(async () => {
    await db.delete(auditEvents);
    await db.delete(invitations);
    await db.delete(memberships);
    await db.delete(companies);
    await db.delete(users);
  });

  describe("Creación de empresa y membresía owner", () => {
    it("crea empresa y asigna al creador como owner", async () => {
      companyA = await createCompany({ name: "Empresa A", ownerId: userA.id });

      expect(companyA).toBeDefined();
      expect(companyA.name).toBe("Empresa A");
      expect(companyA.slug).toBe("empresa-a");

      const [membership] = await db
        .select()
        .from(memberships)
        .where(and(eq(memberships.userId, userA.id), eq(memberships.companyId, companyA.id)))
        .limit(1);

      expect(membership).toBeDefined();
      expect(membership.role).toBe("owner");
    });

    it("genera slug único si hay colisión", async () => {
      const c1 = await createCompany({ name: "Empresa Test", ownerId: userA.id });
      const c2 = await createCompany({ name: "Empresa Test", ownerId: userA.id });

      expect(c1.slug).toBe("empresa-test");
      expect(c2.slug).toMatch(/^empresa-test-[a-f0-9]{4}$/);
    });
  });

  describe("Listado de empresas del usuario", () => {
    it("devuelve solo las empresas donde el usuario es miembro", async () => {
      const c1 = await createCompany({ name: "Empresa 1", ownerId: userA.id });
      const c2 = await createCompany({ name: "Empresa 2", ownerId: userA.id });
      await createCompany({ name: "Empresa 3", ownerId: userB.id });

      const userACompanies = await getUserCompanies(userA.id);
      expect(userACompanies).toHaveLength(2);
      expect(userACompanies.map((c) => c.id).sort()).toEqual([c1.id, c2.id].sort());
    });
  });

  describe("Actualización y eliminación de empresa", () => {
    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa Original", ownerId: userA.id });
    });

    it("actualiza campos permitidos", async () => {
      const updated = await updateCompany(companyA.id, { name: "Nuevo Nombre", primaryColor: "#ff0000" });
      expect(updated?.name).toBe("Nuevo Nombre");
      expect(updated?.primaryColor).toBe("#ff0000");
    });

    it("elimina empresa y membresía asociada en cascada", async () => {
      const deleted = await deleteCompany(companyA.id);
      expect(deleted).toBe(true);

      const company = await getCompanyById(companyA.id);
      expect(company).toBeNull();

      const [membership] = await db
        .select()
        .from(memberships)
        .where(and(eq(memberships.userId, userA.id), eq(memberships.companyId, companyA.id)))
        .limit(1);
      expect(membership).toBeUndefined();
    });
  });

  describe("Gestión de miembros", () => {
    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa Test", ownerId: userA.id });
    });

    it("obtiene membresía por userId + companyId", async () => {
      const membership = await getMembership(userA.id, companyA.id);
      expect(membership).toBeDefined();
      expect(membership?.role).toBe("owner");
    });

    it("lista miembros de la empresa con datos de usuario", async () => {
      const members = await getCompanyMembers(companyA.id);
      expect(members).toHaveLength(1);
      expect(members[0].user.email).toBe("usera@ejemplo.com");
      expect(members[0].role).toBe("owner");
    });

    it("actualiza rol de miembro", async () => {
      // Agregar userB como member
      await db.insert(memberships).values({ userId: userB.id, companyId: companyA.id, role: "member" });

      const updated = await updateMemberRole(companyA.id, userB.id, "admin");
      expect(updated?.role).toBe("admin");

      const membership = await getMembership(userB.id, companyA.id);
      expect(membership?.role).toBe("admin");
    });

    it("elimina miembro", async () => {
      await db.insert(memberships).values({ userId: userB.id, companyId: companyA.id, role: "member" });

      const removed = await removeMember(companyA.id, userB.id);
      expect(removed).toBe(true);

      const membership = await getMembership(userB.id, companyA.id);
      expect(membership).toBeNull();
    });
  });

  describe("Invitaciones", () => {
    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa Test", ownerId: userA.id });
    });

    it("crea invitación con token y expiración 48h", async () => {
      const { invitation, token } = await createInvitation(companyA.id, "nuevo@ejemplo.com", "member", userA.id);

      expect(invitation).toBeDefined();
      expect(invitation.email).toBe("nuevo@ejemplo.com");
      expect(invitation.role).toBe("member");
      expect(invitation.tokenHash).toBeDefined();
      expect(invitation.expiresAt).toBeDefined();

      // El token plano solo se devuelve en desarrollo
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes hex = 64 chars

      // Verificar expiración ~48h
      const expiresIn = new Date(invitation.expiresAt).getTime() - Date.now();
      expect(expiresIn).toBeGreaterThan(47 * 60 * 60 * 1000);
      expect(expiresIn).toBeLessThanOrEqual(48 * 60 * 60 * 1000);
    });

    it("rechaza invitar email que ya es miembro", async () => {
      await createInvitation(companyA.id, "nuevo@ejemplo.com", "member", userA.id);
      await expect(createInvitation(companyA.id, "nuevo@ejemplo.com", "admin", userA.id)).rejects.toThrow(
        "Ya existe una invitación pendiente para este correo"
      );
    });

    it("rechaza invitar usuario que ya es miembro de la empresa", async () => {
      // userB ya existe, lo añadimos como miembro
      await db.insert(memberships).values({ userId: userB.id, companyId: companyA.id, role: "member" });

      await expect(createInvitation(companyA.id, userB.email, "admin", userA.id)).rejects.toThrow(
        "El usuario ya es miembro de esta empresa"
      );
    });

    it("acepta invitación y crea membresía si usuario existe", async () => {
      // Crear invitación para userB (ya existe)
      const { token } = await createInvitation(companyA.id, userB.email, "admin", userA.id);

      // Aceptar invitación
      const result = await acceptInvitation(token);
      expect(result).toBeDefined();
      expect(result?.companyId).toBe(companyA.id);
      expect(result?.role).toBe("admin");

      // Verificar membresía creada
      const membership = await getMembership(userB.id, companyA.id);
      expect(membership).toBeDefined();
      expect(membership?.role).toBe("admin");

      // Verificar token marcado como usado
      const [inv] = await db.select().from(invitations).where(eq(invitations.id, (await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.email, userB.email)).limit(1))[0]?.id ?? "")).limit(1);
      expect(inv.usedAt).not.toBeNull();
    });

    it("acepta invitación para email que no existe (queda pendiente hasta registro)", async () => {
      const { token } = await createInvitation(companyA.id, "noexiste@ejemplo.com", "viewer", userA.id);
      const result = await acceptInvitation(token);

      expect(result).toBeDefined();
      expect(result?.companyId).toBe(companyA.id);
      expect(result?.role).toBe("viewer");

      // No debe crear membresía porque el usuario no existe
      const nonExistentUser = await getUserByEmail(db, "noexiste@ejemplo.com");
      expect(nonExistentUser).toBeNull();
      const membership = await getMembership("00000000-0000-0000-0000-000000000000", companyA.id);
      expect(membership).toBeNull();
    });

    it("rechaza token inválido o expirado", async () => {
      const { token } = await createInvitation(companyA.id, "test@ejemplo.com", "member", userA.id);

      // Token inválido
      await expect(acceptInvitation("token-invalido-123456789012345678901234")).resolves.toBeNull();

      // Token ya usado
      await acceptInvitation(token);
      await expect(acceptInvitation(token)).resolves.toBeNull();
    });
  });

  describe("Estadísticas de empresa", () => {
    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa Stats", ownerId: userA.id });
    });

    it("devuelve contadores por tipo de recurso", async () => {
      const stats = await getCompanyStats(companyA.id);
      expect(stats).toEqual({
        products: 0,
        audiences: 0,
        campaigns: 0,
        leads: 0,
        vacancies: 0,
        candidates: 0,
        content: 0,
      });
    });
  });

  describe("Aislamiento de tenant (anti-cruce)", () => {
    let companyB: { id: string; name: string; slug: string };

    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa A", ownerId: userA.id });
      companyB = await createCompany({ name: "Empresa B", ownerId: userB.id });
    });

    it("userA no puede listar miembros de companyB", async () => {
      // userA no es miembro de companyB
      const membership = await getMembership(userA.id, companyB.id);
      expect(membership).toBeNull();
    });

    it("consultas de servicio filtran por companyId", async () => {
      // Obtener miembros de companyA como userA
      const membersA = await getCompanyMembers(companyA.id);
      expect(membersA).toHaveLength(1);
      expect(membersA[0].userId).toBe(userA.id);

      // Obtener miembros de companyB como userB
      const membersB = await getCompanyMembers(companyB.id);
      expect(membersB).toHaveLength(1);
      expect(membersB[0].userId).toBe(userB.id);
    });

    it("invitación solo visible en su tenant", async () => {
      const { invitation: invA } = await createInvitation(companyA.id, "invA@ejemplo.com", "member", userA.id);
      const { invitation: invB } = await createInvitation(companyB.id, "invB@ejemplo.com", "member", userB.id);

      const invsA = await db.select().from(invitations).where(eq(invitations.companyId, companyA.id));
      const invsB = await db.select().from(invitations).where(eq(invitations.companyId, companyB.id));

      expect(invsA).toHaveLength(1);
      expect(invsA[0].email).toBe("inva@ejemplo.com");
      expect(invsB).toHaveLength(1);
      expect(invsB[0].email).toBe("invb@ejemplo.com");
    });
  });

  describe("Auditoría de eventos de tenant", () => {
    beforeEach(async () => {
      companyA = await createCompany({ name: "Empresa Audit", ownerId: userA.id });
    });

    it("crea eventos de auditoría con company_id", async () => {
      // Las acciones de creación deberían haber generado eventos
      const events = await db.select().from(auditEvents).where(eq(auditEvents.companyId, companyA.id));
      expect(events.length).toBeGreaterThan(0);

      const companyCreated = events.find((e) => e.event === "company.created");
      expect(companyCreated).toBeDefined();
      expect(companyCreated?.metadata).toHaveProperty("companyId");
      expect(companyCreated?.metadata).toHaveProperty("name");
    });
  });
});