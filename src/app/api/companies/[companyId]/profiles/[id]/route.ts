// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getProfileById, updateProfile, deleteProfile } from "@/modules/profiles/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const profile = await getProfileById(id, companyId);
  if (!profile) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ profile });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const profile = await updateProfile(id, body, companyId);
  if (!profile) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ profile });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteProfile(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ ok: true });
}