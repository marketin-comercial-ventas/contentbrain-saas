// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { generateContent, getContentByCompany } from "@/modules/content-studio/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
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
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();

  const { type, objective, channel, tone, productId, audienceId, campaignId, variantsCount } = body;
  if (!type || !objective || !channel || !tone) {
    return jsonError(400, "VALIDATION", "type, objective, channel, tone son requeridos");
  }

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
}