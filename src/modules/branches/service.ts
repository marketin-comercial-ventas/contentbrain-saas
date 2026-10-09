// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { branches, type Branch, type NewBranch } from "@/server/db/schema";

export async function createBranch(companyId: string, data: Omit<NewBranch, "companyId">): Promise<Branch> {
  const [branch] = await db.insert(branches).values({ companyId, ...data }).returning();
  return branch;
}

export async function getBranchById(id: string, companyId?: string): Promise<Branch | null> {
  const condition = companyId
    ? and(eq(branches.id, id), eq(branches.companyId, companyId))
    : eq(branches.id, id);
  const [branch] = await db.select().from(branches).where(condition).limit(1);
  return branch ?? null;
}

export async function getBranchesByCompany(companyId: string): Promise<Branch[]> {
  return db.select().from(branches).where(eq(branches.companyId, companyId)).orderBy(desc(branches.createdAt));
}

export async function getBranchesByBrand(brandId: string, companyId?: string): Promise<Branch[]> {
  const condition = companyId
    ? and(eq(branches.brandId, brandId), eq(branches.companyId, companyId))
    : eq(branches.brandId, brandId);
  return db.select().from(branches).where(condition).orderBy(desc(branches.createdAt));
}

export async function updateBranch(id: string, data: Partial<Omit<NewBranch, "companyId">>, companyId?: string): Promise<Branch | null> {
  const condition = companyId
    ? and(eq(branches.id, id), eq(branches.companyId, companyId))
    : eq(branches.id, id);
  const [branch] = await db.update(branches).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return branch ?? null;
}

export async function deleteBranch(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(branches.id, id), eq(branches.companyId, companyId))
    : eq(branches.id, id);
  const result = await db.delete(branches).where(condition);
  return (result.rowsAffected ?? 0) > 0;
}