// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createLead, getLeadsByCompany, getLeadById, updateLead, moveLead, deleteLead, getLeadPipelineStats } from "@/modules/leads/service";
import { newLeadSchema, updateLeadSchema, moveLeadSchema } from "@/shared/contracts/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
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
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = newLeadSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const lead = await createLead(companyId, parsed.data);
  return NextResponse.json({ lead }, { status: 201 });
}