// @ts-nocheck
import { NextResponse } from "next/server";
import { healthResponseSchema } from "@/shared/contracts/health";
import { buildHealthPayload } from "@/shared/health/payload";

export function GET(): NextResponse {
  const version = process.env.APP_VERSION ?? "dev";
  const payload = healthResponseSchema.parse(buildHealthPayload(version, new Date()));
  return NextResponse.json(payload);
}

