import { db, eq, and, desc, sql, count, isNull, gt } from "@/server/db/client";
import {
  companies,
  memberships,
  users,
  invitations,
  products,
  audiences,
  campaigns,
  leads,
  vacancies,
  candidates,
  generatedContent,
  auditEvents,
  type Company,
  type NewCompany,
  type Membership,
  type NewMembership,
  type Invitation,
  type NewInvitation,
} from "@/server/db/schema";
import { randomBytes, createHash } from "node:crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createCompany(data: { name: string; ownerId: string }): Promise<Company> {
  const baseSlug = slugify(data.name);
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await db.select({ id: companies.id }).from(companies).where(eq(companies.slug, slug)).limit(1);
    if (existing.length === 0) break;
    attempt++;
    slug = `${baseSlug}-${randomBytes(2).toString("hex")}`;
    if (attempt > 5) throw new Error("No se pudo generar slug único");
  }

  const [company] = await db.insert(companies).values({
    name: data.name,
    slug,
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
  }).returning();

  await db.insert(memberships).values({
    userId: data.ownerId,
    companyId: company.id,
    role: "owner",
  });

  // Registrar evento de auditoría
  await db.insert(auditEvents).values({
    userId: data.ownerId,
    companyId: company.id,
    event: "company.created",
    metadata: { companyId: company.id, name: company.name, slug: company.slug },
  });

  return company;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const [company] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return company ?? null;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  return company ?? null;
}

export async function getUserCompanies(userId: string): Promise<(Company & { role: string })[]> {
  const results = await db
    .select({
      id: companies.id,
      name: companies.name,
      slug: companies.slug,
      logoUrl: companies.logoUrl,
      primaryColor: companies.primaryColor,
      secondaryColor: companies.secondaryColor,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
      role: memberships.role,
    })
    .from(companies)
    .innerJoin(memberships, eq(companies.id, memberships.companyId))
    .where(eq(memberships.userId, userId))
    .orderBy(desc(companies.createdAt));

  return results;
}

export async function updateCompany(id: string, data: Partial<NewCompany>): Promise<Company | null> {
  const [company] = await db
    .update(companies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning();
  return company ?? null;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const result = await db.delete(companies).where(eq(companies.id, id)).returning({ id: companies.id });
  return result.length > 0;
}

export async function getMembership(userId: string, companyId: string): Promise<Membership | null> {
  const [m] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.companyId, companyId)))
    .limit(1);
  return m ?? null;
}

export async function getCompanyMembers(companyId: string): Promise<(Membership & { user: { id: string; name: string; email: string } })[]> {
  const results = await db
    .select({
      id: memberships.id,
      userId: memberships.userId,
      companyId: memberships.companyId,
      role: memberships.role,
      createdAt: memberships.createdAt,
      updatedAt: memberships.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.companyId, companyId))
    .orderBy(memberships.createdAt);

  return results;
}

export async function createInvitation(
  companyId: string,
  email: string,
  role: Membership["role"],
  inviterId: string
): Promise<{ invitation: Invitation; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Verificar si el usuario ya existe y es miembro
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existingUser) {
    const existingMember = await getMembership(existingUser.id, companyId);
    if (existingMember) {
      throw new Error("El usuario ya es miembro de esta empresa");
    }
  }

  const existingInvitation = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.companyId, companyId), eq(invitations.email, normalizedEmail), isNull(invitations.usedAt)))
    .limit(1);

  if (existingInvitation.length > 0) {
    throw new Error("Ya existe una invitación pendiente para este correo");
  }

  const token = generateInvitationToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas

  const [invitation] = await db
    .insert(invitations)
    .values({
      companyId,
      email: normalizedEmail,
      role,
      tokenHash,
      expiresAt,
      inviterId,
    })
    .returning();

  // Registrar evento de auditoría
  await db.insert(auditEvents).values({
    userId: inviterId,
    companyId,
    event: "invitation.created",
    metadata: { invitationId: invitation.id, email: normalizedEmail, role },
  });

  return { invitation, token };
}

export async function acceptInvitation(token: string): Promise<{ companyId: string; role: Membership["role"] } | null> {
  const tokenHash = hashToken(token);
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.tokenHash, tokenHash),
        isNull(invitations.usedAt),
        gt(invitations.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!invitation) {
    return null;
  }

  // Verificar si el usuario ya existe
  const [user] = await db.select().from(users).where(eq(users.email, invitation.email)).limit(1);

  if (user) {
    // Usuario ya existe, crear membresía
    const existingMembership = await getMembership(user.id, invitation.companyId);
    if (!existingMembership) {
      await db.insert(memberships).values({
        userId: user.id,
        companyId: invitation.companyId,
        role: invitation.role,
      });

      // Registrar evento de auditoría
      await db.insert(auditEvents).values({
        userId: user.id,
        companyId: invitation.companyId,
        event: "membership.created",
        metadata: { role: invitation.role, invitationId: invitation.id },
      });
    }
  }
  // Si el usuario no existe, la invitación queda pendiente hasta que se registre

  await db
    .update(invitations)
    .set({ usedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  // Registrar evento de auditoría
  await db.insert(auditEvents).values({
    userId: user?.id ?? null,
    companyId: invitation.companyId,
    event: "invitation.accepted",
    metadata: { invitationId: invitation.id, email: invitation.email, userCreated: !!user },
  });

  return { companyId: invitation.companyId, role: invitation.role };
}

export async function updateMemberRole(companyId: string, userId: string, role: Membership["role"]): Promise<Membership | null> {
  const [m] = await db
    .update(memberships)
    .set({ role, updatedAt: new Date() })
    .where(and(eq(memberships.companyId, companyId), eq(memberships.userId, userId)))
    .returning();

  if (m) {
    await db.insert(auditEvents).values({
      userId,
      companyId,
      event: "membership.updated",
      metadata: { role, membershipId: m.id },
    });
  }

  return m ?? null;
}

export async function removeMember(companyId: string, userId: string): Promise<boolean> {
  const result = await db
    .delete(memberships)
    .where(and(eq(memberships.companyId, companyId), eq(memberships.userId, userId)))
    .returning({ id: memberships.id });

  const removed = result.length > 0;

  if (removed) {
    await db.insert(auditEvents).values({
      userId,
      companyId,
      event: "membership.removed",
      metadata: {},
    });
  }

  return removed;
}

/**
 * Invita a un usuario (crea invitación o membresía directa si ya existe).
 * Usada por la API de miembros para compatibilidad.
 */
export async function inviteMember(
  companyId: string,
  email: string,
  role: Membership["role"],
  inviterId: string
): Promise<{ membership: Membership; invitation?: Invitation } | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Verificar si ya es miembro
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existingUser) {
    const existingMembership = await getMembership(existingUser.id, companyId);
    if (existingMembership) {
      return null; // ya es miembro
    }
    // Usuario existe pero no es miembro -> crear membresía directa
    const [membership] = await db
      .insert(memberships)
      .values({ userId: existingUser.id, companyId, role })
      .returning();
    return { membership };
  }

  // Usuario no existe -> crear invitación
  const { invitation } = await createInvitation(companyId, email, role, inviterId);
  return { membership: null as any, invitation }; // la ruta manejará null
}

export async function getCompanyStats(companyId: string): Promise<Record<string, number>> {
  const results = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(audiences).where(eq(audiences.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(vacancies).where(eq(vacancies.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(candidates).where(eq(candidates.companyId, companyId)),
    db.select({ count: sql<number>`count(*)` }).from(generatedContent).where(eq(generatedContent.companyId, companyId)),
  ]);

  return {
    products: Number(results[0][0]?.count ?? 0),
    audiences: Number(results[1][0]?.count ?? 0),
    campaigns: Number(results[2][0]?.count ?? 0),
    leads: Number(results[3][0]?.count ?? 0),
    vacancies: Number(results[4][0]?.count ?? 0),
    candidates: Number(results[5][0]?.count ?? 0),
    content: Number(results[6][0]?.count ?? 0),
  };
}