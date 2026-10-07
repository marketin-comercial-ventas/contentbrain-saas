import { NextResponse } from "next/server";
import { isSameOrigin, jsonError } from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { AuthError, resetPassword } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { okResponseSchema, resetInputSchema } from "@/shared/contracts/auth";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return jsonError(403, "BAD_ORIGIN", "Origen no permitido");
  }
  const limit = rateLimit(`reset:${request.headers.get("x-forwarded-for") ?? "local"}`, {
    limit: 10,
    windowMs: 300_000,
  });
  if (!limit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Demasiados intentos, espera unos minutos");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Cuerpo JSON inválido");
  }
  const parsed = resetInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", "Datos de restablecimiento inválidos");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const { db, client } = createDb(url);
  try {
    await resetPassword(db, parsed.data);
    return NextResponse.json(okResponseSchema.parse({ ok: true }));
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.status, error.code, error.message);
    console.error("reset error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}
