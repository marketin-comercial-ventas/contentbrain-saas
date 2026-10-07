// @ts-nocheck
import { NextResponse } from "next/server";
import { clientIp, isSameOrigin, jsonError } from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { requestPasswordReset } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { forgotInputSchema, forgotResponseSchema } from "@/shared/contracts/auth";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return jsonError(403, "BAD_ORIGIN", "Origen no permitido");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Cuerpo JSON inválido");
  }
  const parsed = forgotInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", "Correo inválido");
  }
  const limit = rateLimit(`forgot:${clientIp(request)}`, { limit: 5, windowMs: 600_000 });
  if (!limit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Demasiadas solicitudes, espera unos minutos");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const { db, client } = createDb(url);
  try {
    const token = await requestPasswordReset(db, parsed.data.email);
    const isProduction = process.env.NODE_ENV === "production";
    const payload = forgotResponseSchema.parse(
      token && !isProduction ? { ok: true, devToken: token } : { ok: true },
    );
    return NextResponse.json(payload);
  } catch (error) {
    console.error("forgot error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}

