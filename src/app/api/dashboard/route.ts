// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth, jsonError } from "@/modules/identity/http";
import { getDashboardMetrics } from "@/modules/dashboard/service";

export async function GET(request: NextRequest) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const metrics = await getDashboardMetrics(session.user.id, companyId);
  return NextResponse.json(metrics);
}
