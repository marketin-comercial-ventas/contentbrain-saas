// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createBranch, getBranchesByCompany, getBranchesByBrand } from "@/modules/branches/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId") ?? undefined;

  const branches = brandId ? await getBranchesByBrand(brandId, companyId) : await getBranchesByCompany(companyId);
  return NextResponse.json({ branches });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const { name, code, type, brandId, address, city, state, country, postalCode, phone, email, latitude, longitude, isActive, isHeadquarters, openingHours } = body;
  if (!name || !code) return jsonError(400, "VALIDATION", "name y code son requeridos");

  const branch = await createBranch(companyId, { name, code, type, brandId, address, city, state, country, postalCode, phone, email, latitude, longitude, isActive, isHeadquarters, openingHours });
  return NextResponse.json({ branch }, { status: 201 });
}