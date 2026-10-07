// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getCampaignById, updateCampaign, deleteCampaign } from "@/modules/campaigns/service";
import { updateCampaignSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const campaign = await getCampaignById(id);
  if (!campaign) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ campaign });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCampaignSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const campaign = await updateCampaign(id, parsed.data);
  if (!campaign) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ campaign });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteCampaign(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Campaña no encontrada");
  return NextResponse.json({ ok: true });
}