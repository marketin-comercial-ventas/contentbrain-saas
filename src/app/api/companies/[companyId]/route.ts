// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getCompanyById, updateCompany, deleteCompany, getCompanyMembers, inviteMember, updateMemberRole, removeMember, getCompanyStats } from "@/modules/companies/service";
import { updateCompanySchema, updateMembershipSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;

  const company = await getCompanyById(companyId);
  if (!company) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  const members = await getCompanyMembers(companyId);
  const stats = await getCompanyStats(companyId);

  return NextResponse.json({ company: { ...company, members, stats } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId, "admin");
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = updateCompanySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const company = await updateCompany(companyId, parsed.data);
  if (!company) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  return NextResponse.json({ company });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId, "owner");
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteCompany(companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  return NextResponse.json({ ok: true });
}