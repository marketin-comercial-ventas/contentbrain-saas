// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getContentById, updateContent, deleteContent, regenerateContent } from "@/modules/content-studio/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const content = await getContentById(id);
  if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ content });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();

  if (body.regenerate) {
    const content = await regenerateContent(id, body.variantsCount);
    if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
    return NextResponse.json({ content });
  }

  const content = await updateContent(id, body);
  if (!content) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ content });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteContent(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Contenido no encontrado");
  return NextResponse.json({ ok: true });
}