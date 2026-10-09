// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { generateContent, getContentByCompany } from "@/modules/content-studio/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const productId = searchParams.get("productId") ?? undefined;
  const campaignId = searchParams.get("campaignId") ?? undefined;

  const content = await getContentByCompany(companyId, { type, productId, campaignId });
  return NextResponse.json({ content });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();

  const { type, objective, channel, tone, productId, audienceId, campaignId, variantsCount } = body;
  if (!type || !objective || !channel || !tone) {
    return jsonError(400, "VALIDATION", "type, objective, channel, tone son requeridos");
  }

  try {
    const content = await generateContent({
      companyId,
      productId,
      audienceId,
      campaignId,
      type,
      objective,
      channel,
      tone,
      variantsCount,
    });
    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CONTENT_GENERATION_FAILED";
    if (["PRODUCT_NOT_FOUND", "AUDIENCE_NOT_FOUND", "CAMPAIGN_NOT_FOUND"].includes(code)) {
      return jsonError(404, "RELATED_RESOURCE_NOT_FOUND", "La relación indicada no pertenece a esta empresa");
    }
    return jsonError(502, "CONTENT_GENERATION_FAILED", "No se pudo generar el contenido");
  }
}