import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createProduct, getProductsByCompany } from "@/modules/products/service";
import { newProductSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if ("response" in authorization) return authorization.response;
  const products = await getProductsByCompany(companyId);
  return NextResponse.json({ products });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if ("response" in authorization) return authorization.response;
  const body = await request.json();
  const parsed = newProductSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos");

  const product = await createProduct(companyId, parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}