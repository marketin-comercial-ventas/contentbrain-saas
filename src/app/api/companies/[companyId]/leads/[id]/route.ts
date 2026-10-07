// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getLeadById, updateLead, moveLead, deleteLead } from "@/modules/leads/service";
import { updateLeadSchema, moveLeadSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ lead });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const body = await request.json();

  if (body.moveOnly) {
    const parsed = moveLeadSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "VALIDATION", "Estado inválido", parsed.error.flatten());
    const lead = await moveLead(id, parsed.data.status);
    if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
    return NextResponse.json({ lead });
  }

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const lead = await updateLead(id, parsed.data);
  if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ lead });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { id } = await params;
  const deleted = await deleteLead(id);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ ok: true });
}