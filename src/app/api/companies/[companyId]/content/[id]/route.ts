// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getContentById, updateContent, deleteContent, regenerateContent } from "@/modules/content-studio/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const content = await getContentById(id, companyId);
  if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ content });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();

  if (body.regenerate) {
    const content = await regenerateContent(id, body.variantsCount, companyId);
    if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
    return NextResponse.json({ content });
  }

  const content = await updateContent(id, body, companyId);
  if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ content });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteContent(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ ok: true });
}