// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createBrand, getBrandsByCompany } from "@/modules/brands/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const brands = await getBrandsByCompany(companyId);
  return NextResponse.json({ brands });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const { name, slug, description, logoUrl, primaryColor, secondaryColor, type, isActive, website, socialLinkedin, socialInstagram, socialTwitter, socialFacebook, socialTiktok } = body;
  if (!name || !slug) return jsonError(400, "VALIDATION", "name y slug son requeridos");

  const brand = await createBrand(companyId, { name, slug, description, logoUrl, primaryColor, secondaryColor, type, isActive, website, socialLinkedin, socialInstagram, socialTwitter, socialFacebook, socialTiktok });
  return NextResponse.json({ brand }, { status: 201 });
}