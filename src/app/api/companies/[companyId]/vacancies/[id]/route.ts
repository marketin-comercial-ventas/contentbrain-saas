// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getVacancyById, updateVacancy, deleteVacancy } from "@/modules/talent/service";
import { updateVacancySchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const vacancy = await getVacancyById(id);
  if (!vacancy) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ vacancy });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateVacancySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const vacancy = await updateVacancy(id, parsed.data);
  if (!vacancy) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ vacancy });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteVacancy(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ ok: true });
}