// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getCompanyMembers, inviteMember } from "@/modules/companies/service";
import { membershipRoleSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const members = await getCompanyMembers(companyId);
  return NextResponse.json({ members });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId, "admin");
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const { email, role } = body;
  if (!email) return jsonError(400, "VALIDATION", "Email requerido");
  const parsedRole = membershipRoleSchema.safeParse(role ?? "member");
  if (!parsedRole.success || parsedRole.data === "owner") {
    return jsonError(400, "VALIDATION", "Rol de invitación no válido");
  }

  const result = await inviteMember(companyId, email, parsedRole.data, authorization.session.user.id);
  if (!result) return jsonError(404, "NOT_FOUND", "Usuario no encontrado");

  return NextResponse.json(result, { status: 201 });
}