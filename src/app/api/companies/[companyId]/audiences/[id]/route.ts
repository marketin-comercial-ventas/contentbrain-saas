// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getAudienceById, updateAudience, deleteAudience } from "@/modules/audiences/service";
import { updateAudienceSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const audience = await getAudienceById(id);
  if (!audience) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ audience });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateAudienceSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const audience = await updateAudience(id, parsed.data);
  if (!audience) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ audience });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteAudience(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Audiencia no encontrada");
  return NextResponse.json({ ok: true });
}