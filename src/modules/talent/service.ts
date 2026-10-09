// @ts-nocheck
import { db, eq, and, desc, sql } from "@/server/db/client";
import { vacancies, candidates, type Vacancy, type NewVacancy, type Candidate, type NewCandidate } from "@/server/db/schema";

export async function createVacancy(companyId: string, data: Omit<NewVacancy, "companyId">): Promise<Vacancy> {
  const [vacancy] = await db.insert(vacancies).values({ companyId, ...data }).returning();
  return vacancy;
}

export async function getVacancyById(id: string, companyId?: string): Promise<Vacancy | null> {
  const condition = companyId
    ? and(eq(vacancies.id, id), eq(vacancies.companyId, companyId))
    : eq(vacancies.id, id);
  const [vacancy] = await db.select().from(vacancies).where(condition).limit(1);
  return vacancy ?? null;
}

export async function getVacanciesByCompany(companyId: string): Promise<Vacancy[]> {
  return db.select().from(vacancies).where(eq(vacancies.companyId, companyId)).orderBy(desc(vacancies.createdAt));
}

export async function updateVacancy(id: string, data: Partial<Omit<NewVacancy, "companyId">>, companyId?: string): Promise<Vacancy | null> {
  const condition = companyId
    ? and(eq(vacancies.id, id), eq(vacancies.companyId, companyId))
    : eq(vacancies.id, id);
  const [vacancy] = await db.update(vacancies).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return vacancy ?? null;
}

export async function deleteVacancy(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(vacancies.id, id), eq(vacancies.companyId, companyId))
    : eq(vacancies.id, id);
  const result = await db.delete(vacancies).where(condition);
  return result.length > 0;
}

export async function createCandidate(companyId: string, data: Omit<NewCandidate, "companyId">): Promise<Candidate> {
  const [candidate] = await db.insert(candidates).values({ companyId, ...data }).returning();
  return candidate;
}

export async function getCandidateById(id: string, companyId?: string): Promise<Candidate | null> {
  const condition = companyId
    ? and(eq(candidates.id, id), eq(candidates.companyId, companyId))
    : eq(candidates.id, id);
  const [candidate] = await db.select().from(candidates).where(condition).limit(1);
  return candidate ?? null;
}

export async function getCandidatesByCompany(companyId: string, filters?: { vacancyId?: string; status?: string }): Promise<Candidate[]> {
  const conditions = [eq(candidates.companyId, companyId)];
  if (filters?.vacancyId) conditions.push(eq(candidates.vacancyId, filters.vacancyId));
  if (filters?.status) conditions.push(eq(candidates.status, filters.status as any));
  return db.select().from(candidates).where(and(...conditions)).orderBy(desc(candidates.createdAt));
}

export async function updateCandidate(id: string, data: Partial<Omit<NewCandidate, "companyId">>, companyId?: string): Promise<Candidate | null> {
  const condition = companyId
    ? and(eq(candidates.id, id), eq(candidates.companyId, companyId))
    : eq(candidates.id, id);
  const [candidate] = await db.update(candidates).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return candidate ?? null;
}

export async function moveCandidate(id: string, status: Candidate["status"], companyId?: string): Promise<Candidate | null> {
  const condition = companyId
    ? and(eq(candidates.id, id), eq(candidates.companyId, companyId))
    : eq(candidates.id, id);
  const [candidate] = await db.update(candidates).set({ status, updatedAt: new Date() }).where(condition).returning();
  return candidate ?? null;
}

export async function deleteCandidate(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(candidates.id, id), eq(candidates.companyId, companyId))
    : eq(candidates.id, id);
  const result = await db.delete(candidates).where(condition);
  return result.length > 0;
}

export async function getVacancyPipelineStats(companyId: string): Promise<Record<string, number>> {
  const statuses = ["nuevo", "preseleccion", "contacto", "entrevista", "finalista", "oferta", "contratado", "rechazado"] as const;
  const stats: Record<string, number> = {};
  for (const status of statuses) {
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(candidates).where(and(eq(candidates.companyId, companyId), eq(candidates.status, status)));
    stats[status] = Number(count);
  }
  return stats;
}