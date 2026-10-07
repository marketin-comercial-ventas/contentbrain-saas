// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getCompanyBrain, upsertCompanyBrain } from "@/modules/company-brain/service";
import { updateCompanyBrainSchema } from "@/shared/contracts/entities";
import { jsonError } from "@/modules/identity/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const brain = await getCompanyBrain(companyId);
  return NextResponse.json({ brain });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const parsed = updateCompanyBrainSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const brain = await upsertCompanyBrain(companyId, parsed.data);
  return NextResponse.json({ brain }, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const { companyId } = await params;
  const body = await request.json();
  const parsed = updateCompanyBrainSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const brain = await upsertCompanyBrain(companyId, parsed.data);
  return NextResponse.json({ brain });
}