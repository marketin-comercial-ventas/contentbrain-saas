// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getCandidateById, updateCandidate, moveCandidate, deleteCandidate } from "@/modules/talent/service";
import { updateCandidateSchema, moveCandidateSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const candidate = await getCandidateById(id, companyId);
  if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ candidate });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();

  if (body.moveOnly) {
    const parsed = moveCandidateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "VALIDATION", "Estado inválido", parsed.error.flatten());
    const candidate = await moveCandidate(id, parsed.data.status, companyId);
    if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
    return NextResponse.json({ candidate });
  }

  const parsed = updateCandidateSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const candidate = await updateCandidate(id, parsed.data, companyId);
  if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ candidate });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteCandidate(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ ok: true });
}