// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { getLeadById, updateLead, moveLead, deleteLead } from "@/modules/leads/service";
import { updateLeadSchema, moveLeadSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const lead = await getLeadById(id, companyId);
  if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ lead });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();

  if (body.moveOnly) {
    const parsed = moveLeadSchema.safeParse(body);
    if (!parsed.success) return jsonError(400, "VALIDATION", "Estado inválido", parsed.error.flatten());
    const lead = await moveLead(id, parsed.data.status, companyId);
    if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
    return NextResponse.json({ lead });
  }

  const parsed = updateLeadSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const lead = await updateLead(id, parsed.data, companyId);
  if (!lead) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ lead });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; id: string }> }
) {
  const { companyId, id } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const deleted = await deleteLead(id, companyId);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Lead no encontrado");
  return NextResponse.json({ ok: true });
}