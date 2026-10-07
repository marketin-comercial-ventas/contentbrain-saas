// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, getDbWithRls } from "@/modules/identity/http";
import { createProfile, getProfilesByCompany, getProfilesByBrand, getProfilesByBranch } from "@/modules/profiles/service";
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
  const branchId = searchParams.get("branchId") ?? undefined;

  let profiles;
  if (brandId) profiles = await getProfilesByBrand(brandId);
  else if (branchId) profiles = await getProfilesByBranch(branchId);
  else profiles = await getProfilesByCompany(companyId);

  return NextResponse.json({ profiles });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const { name, type, description, brandId, branchId, responsibleUserId, settings, kpis, isActive } = body;
  if (!name || !type) return jsonError(400, "VALIDATION", "name y type son requeridos");

  const profile = await createProfile(companyId, { name, type, description, brandId, branchId, responsibleUserId, settings, kpis, isActive });
  return NextResponse.json({ profile }, { status: 201 });
}