// @ts-nocheck
import { db, eq } from "@/server/db/client";
import { companyBrain, type CompanyBrain, type NewCompanyBrain } from "@/server/db/schema";

export async function getCompanyBrain(companyId: string): Promise<CompanyBrain | null> {
  const [brain] = await db.select().from(companyBrain).where(eq(companyBrain.companyId, companyId)).limit(1);
  return brain ?? null;
}

export async function upsertCompanyBrain(companyId: string, data: Omit<NewCompanyBrain, "companyId">): Promise<CompanyBrain> {
  const existing = await getCompanyBrain(companyId);
  if (existing) {
    const [updated] = await db
      .update(companyBrain)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companyBrain.companyId, companyId))
      .returning();
    return updated;
  }
  const [created] = await db.insert(companyBrain).values({ companyId, ...data }).returning();
  return created;
}

export async function deleteCompanyBrain(companyId: string): Promise<boolean> {
  const result = await db.delete(companyBrain).where(eq(companyBrain.companyId, companyId));
  return result.length > 0;
}