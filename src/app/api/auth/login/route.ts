import { NextResponse } from "next/server";
import {
  clientIp,
  isSameOrigin,
  jsonError,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { AuthError, loginUser } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { authUserResponseSchema, loginInputSchema } from "@/shared/contracts/auth";

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
  const parsed = loginInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", "Datos de acceso inválidos");
  }
  const limit = rateLimit(`login:${clientIp(request)}:${parsed.data.email}`, {
    limit: 10,
    windowMs: 300_000,
  });
  if (!limit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Demasiados intentos, espera unos minutos");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const { db, client } = createDb(url);
  try {
    const { user, token } = await loginUser(db, parsed.data);
    const response = NextResponse.json(authUserResponseSchema.parse({ user }));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.status, error.code, error.message);
    console.error("login error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}
