// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getAudienceById, updateAudience, deleteAudience } from "@/modules/audiences/service";
import { updateAudienceSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const audience = await getAudienceById(id, companyId);
  if (!audience) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ audience });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = updateAudienceSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const audience = await updateAudience(id, parsed.data, companyId);
  if (!audience) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ audience });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteAudience(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ ok: true });
}