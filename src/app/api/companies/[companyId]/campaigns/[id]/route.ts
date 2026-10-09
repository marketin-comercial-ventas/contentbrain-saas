// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getCampaignById, updateCampaign, deleteCampaign } from "@/modules/campaigns/service";
import { updateCampaignSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const campaign = await getCampaignById(id, companyId);
  if (!campaign) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ campaign });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = updateCampaignSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const campaign = await updateCampaign(id, parsed.data, companyId);
  if (!campaign) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ campaign });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteCampaign(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ ok: true });
}