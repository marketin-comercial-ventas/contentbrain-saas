// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { campaigns, type Campaign, type NewCampaign } from "@/server/db/schema";

export async function createCampaign(companyId: string, data: Omit<NewCampaign, "companyId">): Promise<Campaign> {
  const [campaign] = await db.insert(campaigns).values({ companyId, ...data }).returning();
  return campaign;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return campaign ?? null;
}

export async function getCampaignsByCompany(companyId: string): Promise<Campaign[]> {
  return db.select().from(campaigns).where(eq(campaigns.companyId, companyId)).orderBy(desc(campaigns.createdAt));
}

export async function updateCampaign(id: string, data: Partial<Omit<NewCampaign, "companyId">>): Promise<Campaign | null> {
  const [campaign] = await db.update(campaigns).set({ ...data, updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
  return campaign ?? null;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const result = await db.delete(campaigns).where(eq(campaigns.id, id));
  return (result.rowCount ?? 0) > 0;
}