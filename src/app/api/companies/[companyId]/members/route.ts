// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getCompanyById, getCompanyMembers, inviteMember, updateMemberRole, removeMember } from "@/modules/companies/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const members = await getCompanyMembers(companyId);
  return NextResponse.json({ members });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const { email, role } = body;
  if (!email) return jsonError(400, "VALIDATION", "Email requerido");

  const result = await inviteMember(companyId, email, role ?? "member", session.user.id);
  if (!result) return jsonError(404, "NOT_FOUND", "Usuario no encontrado");

  return NextResponse.json(result, { status: 201 });
}