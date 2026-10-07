// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { profiles, type Profile, type NewProfile } from "@/server/db/schema";

export async function createProfile(companyId: string, data: Omit<NewProfile, "companyId">): Promise<Profile> {
  const [profile] = await db.insert(profiles).values({ companyId, ...data }).returning();
  return profile;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return profile ?? null;
}

export async function getProfilesByCompany(companyId: string): Promise<Profile[]> {
  return db.select().from(profiles).where(eq(profiles.companyId, companyId)).orderBy(desc(profiles.createdAt));
}

export async function getProfilesByBrand(brandId: string): Promise<Profile[]> {
  return db.select().from(profiles).where(eq(profiles.brandId, brandId)).orderBy(desc(profiles.createdAt));
}

export async function getProfilesByBranch(branchId: string): Promise<Profile[]> {
  return db.select().from(profiles).where(eq(profiles.branchId, branchId)).orderBy(desc(profiles.createdAt));
}

export async function updateProfile(id: string, data: Partial<Omit<NewProfile, "companyId">>): Promise<Profile | null> {
  const [profile] = await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.id, id)).returning();
  return profile ?? null;
}

export async function deleteProfile(id: string): Promise<boolean> {
  const result = await db.delete(profiles).where(eq(profiles.id, id));
  return (result.rowsAffected ?? 0) > 0;
}