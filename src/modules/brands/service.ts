// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { brands, type Brand, type NewBrand } from "@/server/db/schema";

export async function createBrand(companyId: string, data: Omit<NewBrand, "companyId">): Promise<Brand> {
  const [brand] = await db.insert(brands).values({ companyId, ...data }).returning();
  return brand;
}

export async function getBrandById(id: string, companyId?: string): Promise<Brand | null> {
  const condition = companyId
    ? and(eq(brands.id, id), eq(brands.companyId, companyId))
    : eq(brands.id, id);
  const [brand] = await db.select().from(brands).where(condition).limit(1);
  return brand ?? null;
}

export async function getBrandsByCompany(companyId: string): Promise<Brand[]> {
  return db.select().from(brands).where(eq(brands.companyId, companyId)).orderBy(desc(brands.createdAt));
}

export async function updateBrand(id: string, data: Partial<Omit<NewBrand, "companyId">>, companyId?: string): Promise<Brand | null> {
  const condition = companyId
    ? and(eq(brands.id, id), eq(brands.companyId, companyId))
    : eq(brands.id, id);
  const [brand] = await db.update(brands).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return brand ?? null;
}

export async function deleteBrand(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(brands.id, id), eq(brands.companyId, companyId))
    : eq(brands.id, id);
  const result = await db.delete(brands).where(condition);
  return (result.rowsAffected ?? 0) > 0;
}