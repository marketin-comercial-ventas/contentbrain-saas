// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { createProduct, getProductsByCompany, getProductById, updateProduct, deleteProduct } from "@/modules/products/service";
import { newProductSchema, updateProductSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const products = await getProductsByCompany(companyId);
  return NextResponse.json({ products });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const parsed = newProductSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const product = await createProduct(companyId, parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}