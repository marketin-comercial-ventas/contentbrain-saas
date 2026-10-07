// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, getDbWithRls } from "@/modules/identity/http";
import { getProfileById, updateProfile, deleteProfile } from "@/modules/profiles/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ profile });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();
  const profile = await updateProfile(id, body);
  if (!profile) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ profile });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const db = await getDbWithRls(request);
  if (!db) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteProfile(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Perfil no encontrado");
  return NextResponse.json({ ok: true });
}