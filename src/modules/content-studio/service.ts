// @ts-nocheck
import { db, eq, and, desc } from "@/server/db/client";
import { generatedContent, type GeneratedContent, type NewGeneratedContent } from "@/server/db/schema";
import { aiCore } from "@/modules/ai-core/service";
import { buildContentGenerationPrompt } from "@/modules/ai-core/prompts";
import { getCompanyBrain } from "@/modules/company-brain/service";
import { getProductById } from "@/modules/products/service";
import { getAudienceById } from "@/modules/audiences/service";
import { getCampaignById } from "@/modules/campaigns/service";

export async function generateContent(input: {
  companyId: string;
  productId?: string;
  audienceId?: string;
  campaignId?: string;
  type: NewGeneratedContent["type"];
  objective: string;
  channel: string;
  tone: string;
  variantsCount?: number;
}): Promise<GeneratedContent> {
  const brain = await getCompanyBrain(input.companyId);
  if (!brain) throw new Error("Company Brain no configurado");

  let product = null;
  if (input.productId) product = await getProductById(input.productId);

  let audience = null;
  if (input.audienceId) audience = await getAudienceById(input.audienceId);

  let campaign = null;
  if (input.campaignId) campaign = await getCampaignById(input.campaignId);

  const prompt = buildContentGenerationPrompt({
    companyBrain: brain,
    product,
    audience,
    objective: input.objective,
    channel: input.channel,
    tone: input.tone,
    type: input.type,
    variantsCount: input.variantsCount ?? 3,
  });

  const response = await aiCore.complete([
    { role: "system", content: "Eres un experto en marketing digital. Genera SOLO JSON válido." },
    { role: "user", content: prompt },
  ], { temperature: 0.8, maxTokens: 3000 });

  let parsed: any;
  try {
    parsed = JSON.parse(response.content);
  } catch {
    throw new Error("La IA no generó JSON válido");
  }

  const data: Omit<NewGeneratedContent, "companyId"> = {
    productId: input.productId ?? null,
    audienceId: input.audienceId ?? null,
    campaignId: input.campaignId ?? null,
    type: input.type,
    prompt,
    input: { objective: input.objective, channel: input.channel, tone: input.tone },
    output: parsed.principal,
    variants: parsed.variants ?? [],
    model: aiCore.getModel(),
    tokensUsed: response.tokensUsed,
    status: "completed",
  };

  const [content] = await db.insert(generatedContent).values({ companyId: input.companyId, ...data }).returning();
  return content;
}

export async function getContentById(id: string): Promise<GeneratedContent | null> {
  const [content] = await db.select().from(generatedContent).where(eq(generatedContent.id, id)).limit(1);
  return content ?? null;
}

export async function getContentByCompany(companyId: string, filters?: { type?: string; productId?: string; campaignId?: string }): Promise<GeneratedContent[]> {
  const conditions = [eq(generatedContent.companyId, companyId)];
  if (filters?.type) conditions.push(eq(generatedContent.type, filters.type as any));
  if (filters?.productId) conditions.push(eq(generatedContent.productId, filters.productId));
  if (filters?.campaignId) conditions.push(eq(generatedContent.campaignId, filters.campaignId));
  return db.select().from(generatedContent).where(and(...conditions)).orderBy(desc(generatedContent.createdAt));
}

export async function updateContent(id: string, data: Partial<Omit<NewGeneratedContent, "companyId">>): Promise<GeneratedContent | null> {
  const [content] = await db.update(generatedContent).set({ ...data, updatedAt: new Date() }).where(eq(generatedContent.id, id)).returning();
  return content ?? null;
}

export async function deleteContent(id: string): Promise<boolean> {
  const result = await db.delete(generatedContent).where(eq(generatedContent.id, id));
  return (result.rowCount ?? 0) > 0;
}

export async function regenerateContent(id: string, variantsCount?: number): Promise<GeneratedContent | null> {
  const existing = await getContentById(id);
  if (!existing) return null;

  return generateContent({
    companyId: existing.companyId,
    productId: existing.productId ?? undefined,
    audienceId: existing.audienceId ?? undefined,
    campaignId: existing.campaignId ?? undefined,
    type: existing.type,
    objective: existing.input.objective as string,
    channel: existing.input.channel as string,
    tone: existing.input.tone as string,
    variantsCount,
  });
}