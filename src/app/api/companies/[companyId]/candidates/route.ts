// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createCandidate, getCandidatesByCompany, getCandidateById, updateCandidate, moveCandidate, deleteCandidate } from "@/modules/talent/service";
import { newCandidateSchema, updateCandidateSchema, moveCandidateSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const { searchParams } = new URL(request.url);
  const vacancyId = searchParams.get("vacancyId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const candidates = await getCandidatesByCompany(companyId, { vacancyId, status });
  return NextResponse.json({ candidates });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = newCandidateSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const candidate = await createCandidate(companyId, parsed.data);
  return NextResponse.json({ candidate }, { status: 201 });
}