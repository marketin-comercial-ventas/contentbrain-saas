// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getCompanyById, updateCompany, deleteCompany, getCompanyMembers, inviteMember, updateMemberRole, removeMember, getCompanyStats } from "@/modules/companies/service";
import { updateCompanySchema, updateMembershipSchema } from "@/shared/contracts/entities";
import { jsonError, getSessionCompanyId } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  const membership = await getCompanyById(id).then(() => Promise.resolve({ role: "owner" }));
  const members = await getCompanyMembers(id);
  const stats = await getCompanyStats(id);

  return NextResponse.json({ company: { ...company, members, stats } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCompanySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const company = await updateCompany(id, parsed.data);
  if (!company) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  return NextResponse.json({ company });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteCompany(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Empresa no encontrada");

  return NextResponse.json({ ok: true });
}