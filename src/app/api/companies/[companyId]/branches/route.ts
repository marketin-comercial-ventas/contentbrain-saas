// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, getDbWithRls } from "@/modules/identity/http";
import { createBranch, getBranchesByCompany, getBranchesByBrand } from "@/modules/branches/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId") ?? undefined;

  const branches = brandId ? await getBranchesByBrand(brandId) : await getBranchesByCompany(companyId);
  return NextResponse.json({ branches });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const { name, code, type, brandId, address, city, state, country, postalCode, phone, email, latitude, longitude, isActive, isHeadquarters, openingHours } = body;
  if (!name || !code) return jsonError(400, "VALIDATION", "name y code son requeridos");

  const branch = await createBranch(companyId, { name, code, type, brandId, address, city, state, country, postalCode, phone, email, latitude, longitude, isActive, isHeadquarters, openingHours });
  return NextResponse.json({ branch }, { status: 201 });
}