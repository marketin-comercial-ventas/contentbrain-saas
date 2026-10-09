// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createAudience, getAudiencesByCompany, generateAudienceWithAI } from "@/modules/audiences/service";
import { newAudienceSchema, generateAudienceSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const audiences = await getAudiencesByCompany(companyId);
  return NextResponse.json({ audiences });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();

  if (body.generateWithAI) {
    const parsed = generateAudienceSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());
    const audience = await generateAudienceWithAI(companyId, parsed.data.productId, parsed.data.brief);
    return NextResponse.json({ audience }, { status: 201 });
  }

  const parsed = newAudienceSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const audience = await createAudience(companyId, parsed.data);
  return NextResponse.json({ audience }, { status: 201 });
}