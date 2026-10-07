// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { branches, type Branch, type NewBranch } from "@/server/db/schema";

export async function createBranch(companyId: string, data: Omit<NewBranch, "companyId">): Promise<Branch> {
  const [branch] = await db.insert(branches).values({ companyId, ...data }).returning();
  return branch;
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const [branch] = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return branch ?? null;
}

export async function getBranchesByCompany(companyId: string): Promise<Branch[]> {
  return db.select().from(branches).where(eq(branches.companyId, companyId)).orderBy(desc(branches.createdAt));
}

export async function getBranchesByBrand(brandId: string): Promise<Branch[]> {
  return db.select().from(branches).where(eq(branches.brandId, brandId)).orderBy(desc(branches.createdAt));
}

export async function updateBranch(id: string, data: Partial<Omit<NewBranch, "companyId">>): Promise<Branch | null> {
  const [branch] = await db.update(branches).set({ ...data, updatedAt: new Date() }).where(eq(branches.id, id)).returning();
  return branch ?? null;
}

export async function deleteBranch(id: string): Promise<boolean> {
  const result = await db.delete(branches).where(eq(branches.id, id));
  return (result.rowsAffected ?? 0) > 0;
}