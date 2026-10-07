// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getCandidateById, updateCandidate, moveCandidate, deleteCandidate } from "@/modules/talent/service";
import { updateCandidateSchema, moveCandidateSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const candidate = await getCandidateById(id);
  if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ candidate });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();

  if (body.moveOnly) {
    const parsed = moveCandidateSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "VALIDATION", "Estado inválido", parsed.error.flatten());
    const candidate = await moveCandidate(id, parsed.data.status);
    if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
    return NextResponse.json({ candidate });
  }

  const parsed = updateCandidateSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const candidate = await updateCandidate(id, parsed.data);
  if (!candidate) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ candidate });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteCandidate(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Candidato no encontrado");
  return NextResponse.json({ ok: true });
}