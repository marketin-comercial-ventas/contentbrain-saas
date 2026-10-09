// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { profiles, type Profile, type NewProfile } from "@/server/db/schema";

export async function createProfile(companyId: string, data: Omit<NewProfile, "companyId">): Promise<Profile> {
  const [profile] = await db.insert(profiles).values({ companyId, ...data }).returning();
  return profile;
}

export async function getProfileById(id: string, companyId?: string): Promise<Profile | null> {
  const condition = companyId
    ? and(eq(profiles.id, id), eq(profiles.companyId, companyId))
    : eq(profiles.id, id);
  const [profile] = await db.select().from(profiles).where(condition).limit(1);
  return profile ?? null;
}

export async function getProfilesByCompany(companyId: string): Promise<Profile[]> {
  return db.select().from(profiles).where(eq(profiles.companyId, companyId)).orderBy(desc(profiles.createdAt));
}

export async function getProfilesByBrand(brandId: string, companyId?: string): Promise<Profile[]> {
  const condition = companyId
    ? and(eq(profiles.brandId, brandId), eq(profiles.companyId, companyId))
    : eq(profiles.brandId, brandId);
  return db.select().from(profiles).where(condition).orderBy(desc(profiles.createdAt));
}

export async function getProfilesByBranch(branchId: string, companyId?: string): Promise<Profile[]> {
  const condition = companyId
    ? and(eq(profiles.branchId, branchId), eq(profiles.companyId, companyId))
    : eq(profiles.branchId, branchId);
  return db.select().from(profiles).where(condition).orderBy(desc(profiles.createdAt));
}

export async function updateProfile(id: string, data: Partial<Omit<NewProfile, "companyId">>, companyId?: string): Promise<Profile | null> {
  const condition = companyId
    ? and(eq(profiles.id, id), eq(profiles.companyId, companyId))
    : eq(profiles.id, id);
  const [profile] = await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return profile ?? null;
}

export async function deleteProfile(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(profiles.id, id), eq(profiles.companyId, companyId))
    : eq(profiles.id, id);
  const result = await db.delete(profiles).where(condition);
  return (result.rowsAffected ?? 0) > 0;
}