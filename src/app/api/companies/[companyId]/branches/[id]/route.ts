// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getBranchById, updateBranch, deleteBranch } from "@/modules/branches/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const branch = await getBranchById(id, companyId);
  if (!branch) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ branch });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const branch = await updateBranch(id, body, companyId);
  if (!branch) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ branch });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteBranch(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ ok: true });
}