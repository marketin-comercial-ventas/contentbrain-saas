// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/identity/http";
import { getDashboardMetrics } from "@/modules/dashboard/service";
import { jsonError } from "@/modules/identity/http";

export async function GET(request: NextRequest) {
  const session = await auth(request);
  if (!session) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");

  const metrics = await getDashboardMetrics(session.user.id);
  return NextResponse.json(metrics);
}
