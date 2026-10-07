// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, getDbWithRls } from "@/modules/identity/http";
import { getBranchById, updateBranch, deleteBranch } from "@/modules/branches/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const branch = await getBranchById(id);
  if (!branch) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ branch });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const branch = await updateBranch(id, body);
  if (!branch) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ branch });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteBranch(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Sucursal no encontrada");
  return NextResponse.json({ ok: true });
}