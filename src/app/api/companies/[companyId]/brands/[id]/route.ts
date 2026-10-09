// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getBrandById, updateBrand, deleteBrand } from "@/modules/brands/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const brand = await getBrandById(id, companyId);
  if (!brand) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ brand });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const brand = await updateBrand(id, body, companyId);
  if (!brand) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ brand });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteBrand(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ ok: true });
}