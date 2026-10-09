// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, jsonError } from "@/modules/identity/http";
import { createCompany, getUserCompanies } from "@/modules/companies/service";
import { newCompanySchema } from "@/shared/contracts/entities";

export async function GET(request: NextRequest) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const companies = await getUserCompanies(session.user.id);
  return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const body = await request.json();
  const parsed = newCompanySchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  const company = await createCompany({ name: parsed.data.name, ownerId: session.user.id });
  return NextResponse.json({ company }, { status: 201 });
}
