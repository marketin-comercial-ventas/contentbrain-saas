// @ts-nocheck
import { db, eq, and, desc, sql } from "@/server/db/client";
import { leads, type Lead, type NewLead } from "@/server/db/schema";

export async function createLead(companyId: string, data: Omit<NewLead, "companyId">): Promise<Lead> {
  const [lead] = await db.insert(leads).values({ companyId, ...data }).returning();
  return lead;
}

export async function getLeadById(id: string, companyId?: string): Promise<Lead | null> {
  const condition = companyId
    ? and(eq(leads.id, id), eq(leads.companyId, companyId))
    : eq(leads.id, id);
  const [lead] = await db.select().from(leads).where(condition).limit(1);
  return lead ?? null;
}

export async function getLeadsByCompany(companyId: string, filters?: { status?: string; campaignId?: string; assignedTo?: string }): Promise<Lead[]> {
  const conditions = [eq(leads.companyId, companyId)];
  if (filters?.status) conditions.push(eq(leads.status, filters.status as any));
  if (filters?.campaignId) conditions.push(eq(leads.campaignId, filters.campaignId));
  if (filters?.assignedTo) conditions.push(eq(leads.assignedTo, filters.assignedTo));
  return db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt));
}

export async function updateLead(id: string, data: Partial<Omit<NewLead, "companyId">>, companyId?: string): Promise<Lead | null> {
  const condition = companyId
    ? and(eq(leads.id, id), eq(leads.companyId, companyId))
    : eq(leads.id, id);
  const [lead] = await db.update(leads).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return lead ?? null;
}

export async function moveLead(id: string, status: Lead["status"], companyId?: string): Promise<Lead | null> {
  const condition = companyId
    ? and(eq(leads.id, id), eq(leads.companyId, companyId))
    : eq(leads.id, id);
  const [lead] = await db.update(leads).set({ status, updatedAt: new Date() }).where(condition).returning();
  return lead ?? null;
}

export async function deleteLead(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(leads.id, id), eq(leads.companyId, companyId))
    : eq(leads.id, id);
  const result = await db.delete(leads).where(condition);
  return result.length > 0;
}

export async function getLeadPipelineStats(companyId: string): Promise<Record<string, number>> {
  const statuses = ["nuevo", "contactado", "calificado", "propuesta", "ganado", "perdido"] as const;
  const stats: Record<string, number> = {};
  for (const status of statuses) {
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(leads).where(and(eq(leads.companyId, companyId), eq(leads.status, status)));
    stats[status] = Number(count);
  }
  return stats;
}