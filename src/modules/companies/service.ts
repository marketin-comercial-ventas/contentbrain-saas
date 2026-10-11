import { db } from "@/server/db/client";
import { companies, type Company, type NewCompany, memberships } from "@/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function createCompany(data: Omit<NewCompany, "id">, userId: string): Promise<Company> {
  // Start a transaction to ensure company and membership are created together
  const result = await db.transaction(async (tx) => {
    // Create the company
    const [company] = await tx.insert(companies).values(data).returning();

    // Create the initial membership for the user as owner
    await tx.insert(memberships).values({
      userId,
      companyId: company.id,
      role: "owner",
    });

    return company;
  });

  return result;
}

export async function getCompanyById(id: string, userId?: string): Promise<Company | null> {
  const condition = userId
    ? and(
        eq(companies.id, id),
        eq(memberships.companyId, id),
        eq(memberships.userId, userId)
      )
    : eq(companies.id, id);

  const [company] = await db
    .select()
    .from(companies)
    .leftJoin(memberships, eq(companies.id, memberships.companyId))
    .where(condition)
    .limit(1);

  return company ?? null;
}

export async function getCompanyBySlug(slug: string, userId?: string): Promise<Company | null> {
  const condition = userId
    ? and(
        eq(companies.slug, slug),
        eq(memberships.companyId, companies.id),
        eq(memberships.userId, userId)
      )
    : eq(companies.slug, slug);

  const [company] = await db
    .select()
    .from(companies)
    .leftJoin(memberships, eq(companies.id, memberships.companyId))
    .where(condition)
    .limit(1);

  return company ?? null;
}

export async function updateCompany(id: string, data: Partial<Omit<NewCompany, "id">>, userId: string): Promise<Company | null> {
  // First, check if the user is an owner or admin of the company
  const membership = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.companyId, id),
        inArray(memberships.role, ["owner", "admin"])
      )
    );

  if (membership.length === 0) {
    return null; // Not authorized
  }

  const [company] = await db
    .update(companies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning();

  return company ?? null;
}

export async function getCompaniesByUser(userId: string): Promise<Company[]> {
  const companiesList = await db
    .select({ company: companies })
    .from(companies)
    .innerJoin(memberships, eq(companies.id, memberships.companyId))
    .where(eq(memberships.userId, userId))
    .orderBy(desc(companies.createdAt));

  return companiesList.map(({ company }) => company);
}

export async function deleteCompany(id: string, userId: string): Promise<boolean> {
  // Only owner can delete
  const membership = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.companyId, id),
        eq(memberships.role, "owner")
      )
    );

  if (membership.length === 0) {
    return false; // Not authorized
  }

  const result = await db.delete(companies).where(eq(companies.id, id));
  return (result.rowsAffected ?? 0) > 0;
}