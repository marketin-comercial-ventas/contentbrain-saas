// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { audiences, type Audience, type NewAudience } from "@/server/db/schema";
import { aiCore } from "@/modules/ai-core/service";
import { buildAudienceGenerationPrompt } from "@/modules/ai-core/prompts";
import { getCompanyBrain } from "@/modules/company-brain/service";
import { getProductById } from "@/modules/products/service";

export async function createAudience(companyId: string, data: Omit<NewAudience, "companyId">): Promise<Audience> {
  const [audience] = await db.insert(audiences).values({ companyId, ...data }).returning();
  return audience;
}

export async function getAudienceById(id: string, companyId?: string): Promise<Audience | null> {
  const condition = companyId
    ? and(eq(audiences.id, id), eq(audiences.companyId, companyId))
    : eq(audiences.id, id);
  const [audience] = await db.select().from(audiences).where(condition).limit(1);
  return audience ?? null;
}

export async function getAudiencesByCompany(companyId: string): Promise<Audience[]> {
  return db.select().from(audiences).where(eq(audiences.companyId, companyId)).orderBy(desc(audiences.createdAt));
}

export async function updateAudience(id: string, data: Partial<Omit<NewAudience, "companyId">>, companyId?: string): Promise<Audience | null> {
  const condition = companyId
    ? and(eq(audiences.id, id), eq(audiences.companyId, companyId))
    : eq(audiences.id, id);
  const [audience] = await db.update(audiences).set({ ...data, updatedAt: new Date() }).where(condition).returning();
  return audience ?? null;
}

export async function deleteAudience(id: string, companyId?: string): Promise<boolean> {
  const condition = companyId
    ? and(eq(audiences.id, id), eq(audiences.companyId, companyId))
    : eq(audiences.id, id);
  const result = await db.delete(audiences).where(condition);
  return (result.rowsAffected ?? 0) > 0;
}

export async function generateAudienceWithAI(companyId: string, productId: string | undefined, brief: string): Promise<Audience> {
  const brain = await getCompanyBrain(companyId);
  if (!brain) throw new Error("Company Brain no configurado");

  let product = null;
  if (productId) {
    product = await getProductById(productId, companyId);
  }

  const prompt = buildAudienceGenerationPrompt(brain, product, brief);
  const response = await aiCore.complete([
    { role: "system", content: "Eres un estratega de marketing. Genera SOLO JSON válido." },
    { role: "user", content: prompt },
  ], { temperature: 0.7, maxTokens: 2000 });

  let parsed: any;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new Error("La IA no generó JSON válido");
  }

  const audienceData = {
    name: parsed.name,
    description: parsed.description,
    avatarName: parsed.avatarName,
    demographics: parsed.demographics,
    needs: parsed.needs ?? [],
    pains: parsed.pains ?? [],
    motivations: parsed.motivations ?? [],
    objections: parsed.objections ?? [],
    tone: parsed.tone ?? "profesional",
    cta: parsed.cta,
  };

  return createAudience(companyId, audienceData);
}