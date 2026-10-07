// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { createLead, getLeadsByCompany, getLeadById, updateLead, moveLead, deleteLead, getLeadPipelineStats } from "@/modules/leads/service";
import { newLeadSchema, updateLeadSchema, moveLeadSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const campaignId = searchParams.get("campaignId") ?? undefined;

  const leads = await getLeadsByCompany(companyId, { status, campaignId });
  const stats = await getLeadPipelineStats(companyId);
  return NextResponse.json({ leads, stats });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const parsed = newLeadSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const lead = await createLead(companyId, parsed.data);
  return NextResponse.json({ lead }, { status: 201 });
}