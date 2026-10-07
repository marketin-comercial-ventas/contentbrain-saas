// @ts-nocheck
import { db, eq, and, desc, count, sql } from "@/server/db/client";
import { companies, memberships, users, products, audiences, campaigns, leads, vacancies, candidates, generatedContent, type Company, type NewCompany, type Membership, type NewMembership } from "@/server/db/schema";
import { randomBytes } from "node:crypto";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
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
  const result = await db.delete(companies).where(eq(companies.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function getMembership(userId: string, companyId: string): Promise<Membership | null> {
  const [m] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.companyId, companyId))).limit(1);
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

export async function inviteMember(companyId: string, email: string, role: Membership["role"] = "member", inviterId: string): Promise<{ membership: Membership; user: { id: string; name: string; email: string } } | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return null;

  const existing = await getMembership(user.id, companyId);
  if (existing) throw new Error("El usuario ya es miembro de esta empresa");

  const [membership] = await db.insert(memberships).values({
    userId: user.id,
    companyId,
    role,
  }).returning();

  return { membership, user: { id: user.id, name: user.name, email: user.email } };
}

export async function updateMemberRole(companyId: string, userId: string, role: Membership["role"]): Promise<Membership | null> {
  const [m] = await db
    .update(memberships)
    .set({ role, updatedAt: new Date() })
    .where(and(eq(memberships.companyId, companyId), eq(memberships.userId, userId)))
    .returning();
  return m ?? null;
}

export async function removeMember(companyId: string, userId: string): Promise<boolean> {
  const result = await db.delete(memberships).where(and(eq(memberships.companyId, companyId), eq(memberships.userId, userId)));
  return (result.rowCount ?? 0) > 0;
}

export async function getCompanyStats(companyId: string): Promise<Record<string, number>> {
  const [
    { count: productsCount },
    { count: audiencesCount },
    { count: campaignsCount },
    { count: leadsCount },
    { count: vacanciesCount },
    { count: candidatesCount },
    { count: contentCount },
  ] = await Promise.all([
    db.select({ count: sql`count(*)` }).from(products).where(eq(products.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(audiences).where(eq(audiences.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(campaigns).where(eq(campaigns.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(leads).where(eq(leads.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(vacancies).where(eq(vacancies.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(candidates).where(eq(candidates.companyId, companyId)),
    db.select({ count: sql`count(*)` }).from(generatedContent).where(eq(generatedContent.companyId, companyId)),
  ]);

  return {
    products: Number(productsCount),
    audiences: Number(audiencesCount),
    campaigns: Number(campaignsCount),
    leads: Number(leadsCount),
    vacancies: Number(vacanciesCount),
    candidates: Number(candidatesCount),
    content: Number(contentCount),
  };
}