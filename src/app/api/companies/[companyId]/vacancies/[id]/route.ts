// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getVacancyById, updateVacancy, deleteVacancy } from "@/modules/talent/service";
import { updateVacancySchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const vacancy = await getVacancyById(id, companyId);
  if (!vacancy) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ vacancy });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = updateVacancySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const vacancy = await updateVacancy(id, parsed.data, companyId);
  if (!vacancy) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ vacancy });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteVacancy(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Vacante no encontrada");
  return NextResponse.json({ ok: true });
}