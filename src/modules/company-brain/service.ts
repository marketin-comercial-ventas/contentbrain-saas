import { db, eq } from "@/server/db/client";
import { 
  companyBrain, 
  type CompanyBrain, 
  type NewCompanyBrain,
  brainVersions,
  type BrainVersion,
  type NewBrainVersion
} from "@/server/db/schema";

export async function getCompanyBrain(companyId: string): Promise<CompanyBrain | null> {
  const [brain] = await db.select().from(companyBrain).where(eq(companyBrain.companyId, companyId)).limit(1);
  return brain ?? null;
}

export async function upsertCompanyBrain(companyId: string, data: Omit<NewCompanyBrain, "companyId">, userId?: string): Promise<CompanyBrain> {
  const existing = await getCompanyBrain(companyId);
  
  if (existing) {
    // Guardar versión anterior antes de actualizar
    await db.insert(brainVersions).values({
      brainId: existing.id,
      version: existing.version,
      name: existing.name,
      description: existing.description,
      industry: existing.industry,
      valueProposition: existing.valueProposition,
      targetAudience: existing.targetAudience,
      tone: existing.tone,
      website: existing.website,
      whatsapp: existing.whatsapp,
      socialLinkedin: existing.socialLinkedin,
      socialInstagram: existing.socialInstagram,
      socialTwitter: existing.socialTwitter,
      socialFacebook: existing.socialFacebook,
      socialTiktok: existing.socialTiktok,
      products: existing.products,
      services: existing.services,
      createdBy: userId ?? existing.createdBy
    });
    
    const [updated] = await db
      .update(companyBrain)
      .set({ 
        ...data, 
        updatedAt: new Date(),
        version: existing.version + 1
      })
      .where(eq(companyBrain.companyId, companyId))
      .returning();
    return updated;
  }
  
  const [created] = await db.insert(companyBrain).values({ 
    companyId, 
    ...data,
    createdBy: userId ?? undefined,
    version: 1
  }).returning();
  return created;
}

export async function approveCompanyBrain(companyId: string, userId: string): Promise<{ ok: boolean }> {
  const existing = await getCompanyBrain(companyId);
  if (!existing) {
    throw new Error("Brain not found");
  }
  
  if (existing.isApproved) {
    throw new Error("Brain already approved");
  }
  
  const [updated] = await db
    .update(companyBrain)
    .set({ 
      isApproved: true,
      approvedBy: userId,
      updatedAt: new Date()
    })
    .where(eq(companyBrain.companyId, companyId))
    .returning();
    
  return { ok: !!updated };
}

export async function rejectCompanyBrain(companyId: string): Promise<{ ok: boolean }> {
  const existing = await getCompanyBrain(companyId);
  if (!existing) {
    throw new Error("Brain not found");
  }
  
  if (!existing.isApproved) {
    throw new Error("Brain is not approved");
  }
  
  const [updated] = await db
    .update(companyBrain)
    .set({ 
      isApproved: false,
      approvedBy: null,
      updatedAt: new Date()
    })
    .where(eq(companyBrain.companyId, companyId))
    .returning();
    
  return { ok: !!updated };
}

export async function getBrainVersions(companyId: string): Promise<Array<BrainVersion & { brainId: string }>> {
  const brain = await getCompanyBrain(companyId);
  if (!brain) return [];
  
  const versions = await db
    .select()
    .from(brainVersions)
    .where(eq(brainVersions.brainId, brain.id))
    .orderBy(brainVersions.version);
    
  return versions.map(v => ({ ...v, brainId: v.brainId.toString() }));
}

export async function deleteCompanyBrain(companyId: string): Promise<boolean> {
  const result = await db.delete(companyBrain).where(eq(companyBrain.companyId, companyId));
  return result.length > 0;
}
