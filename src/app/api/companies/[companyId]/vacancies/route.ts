// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createVacancy, getVacanciesByCompany, getVacancyById, updateVacancy, deleteVacancy } from "@/modules/talent/service";
import { newVacancySchema, updateVacancySchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const vacancies = await getVacanciesByCompany(companyId);
  return NextResponse.json({ vacancies });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = newVacancySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const vacancy = await createVacancy(companyId, parsed.data);
  return NextResponse.json({ vacancy }, { status: 201 });
}