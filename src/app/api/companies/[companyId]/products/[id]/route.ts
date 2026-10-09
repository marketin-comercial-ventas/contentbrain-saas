import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getProductById, updateProduct, deleteProduct } from "@/modules/products/service";
import { updateProductSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if ("response" in authorization) return authorization.response;
  const product = await getProductById(id, companyId);
  if (!product) return jsonError(404, "NOT_FOUND", "Producto no encontrado");
  return NextResponse.json({ product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if ("response" in authorization) return authorization.response;
  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos");

  const product = await updateProduct(id, parsed.data, companyId);
  if (!product) return jsonError(404, "NOT_FOUND", "Producto no encontrado");
  return NextResponse.json({ product });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if ("response" in authorization) return authorization.response;
  const deleted = await deleteProduct(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Producto no encontrado");
  return NextResponse.json({ ok: true });
}