// @ts-nocheck
import { db, eq, desc, count } from "@/server/db/client";
import { companies, products, audiences, campaigns, leads, vacancies, candidates, generatedContent, memberships, users } from "@/server/db/schema";
import { getCompanyStats } from "@/modules/companies/service";
import { getLeadPipelineStats } from "@/modules/leads/service";
import { getVacancyPipelineStats } from "@/modules/talent/service";

export async function getDashboardMetrics(userId: string): Promise<{
  companies: Array<{ id: string; name: string; slug: string; stats: Record<string, number> }>;
  totals: Record<string, number>;
  leadPipeline: Record<string, number>;
  talentPipeline: Record<string, number>;
  recentContent: Array<{ id: string; type: string; createdAt: string }>;
  recentLeads: Array<{ id: string; name: string; status: string; createdAt: string }>;
  recentCandidates: Array<{ id: string; name: string; status: string; createdAt: string }>;
}> {
  const userCompanies = await db
    .select({ id: companies.id, name: companies.name, slug: companies.slug })
    .from(companies)
    .innerJoin(memberships, eq(companies.id, memberships.companyId))
    .where(eq(memberships.userId, userId));

  const companyStats = await Promise.all(
    userCompanies.map(async (c) => ({
      ...c,
      stats: await getCompanyStats(c.id),
    }))
  );

  const totals = companyStats.reduce(
    (acc, c) => {
      for (const [k, v] of Object.entries(c.stats)) acc[k] = (acc[k] ?? 0) + v;
      return acc;
    },
    {} as Record<string, number>
  );

  const allCompanyIds = userCompanies.map(c => c.id);
  const [leadPipeline, talentPipeline, recentContent, recentLeads, recentCandidates] = await Promise.all([
    getLeadPipelineStats(allCompanyIds[0] ?? ""),
    getVacancyPipelineStats(allCompanyIds[0] ?? ""),
    db.select({ id: generatedContent.id, type: generatedContent.type, createdAt: generatedContent.createdAt })
      .from(generatedContent)
      .where(eq(generatedContent.companyId, allCompanyIds[0] ?? ""))
      .orderBy(desc(generatedContent.createdAt))
      .limit(5),
    db.select({ id: leads.id, name: leads.name, status: leads.status, createdAt: leads.createdAt })
      .from(leads)
      .where(eq(leads.companyId, allCompanyIds[0] ?? ""))
      .orderBy(desc(leads.createdAt))
      .limit(5),
    db.select({ id: candidates.id, name: candidates.name, status: candidates.status, createdAt: candidates.createdAt })
      .from(candidates)
      .where(eq(candidates.companyId, allCompanyIds[0] ?? ""))
      .orderBy(desc(candidates.createdAt))
      .limit(5),
  ]);

  return {
    companies: companyStats,
    totals,
    leadPipeline,
    talentPipeline,
    recentContent: recentContent.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    recentLeads: recentLeads.map(l => ({ ...l, createdAt: l.createdAt.toISOString() })),
    recentCandidates: recentCandidates.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
  };
}