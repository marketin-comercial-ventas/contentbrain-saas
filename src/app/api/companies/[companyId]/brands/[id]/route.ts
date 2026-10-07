// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, getDbWithRls } from "@/modules/identity/http";
import { getBrandById, updateBrand, deleteBrand } from "@/modules/brands/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const brand = await getBrandById(id);
  if (!brand) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ brand });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const brand = await updateBrand(id, body);
  if (!brand) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ brand });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteBrand(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Marca no encontrada");
  return NextResponse.json({ ok: true });
}