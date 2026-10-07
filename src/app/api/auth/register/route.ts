import { NextResponse } from "next/server";
import { clientIp, isSameOrigin, jsonError } from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { AuthError, registerUser } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { authUserResponseSchema, registerInputSchema } from "@/shared/contracts/auth";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return jsonError(403, "BAD_ORIGIN", "Origen no permitido");
  }
  const limit = rateLimit(`register:${clientIp(request)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Demasiadas solicitudes, intenta más tarde");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Cuerpo JSON inválido");
  }
  const parsed = registerInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", "Datos de registro inválidos");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const { db, client } = createDb(url);
  try {
    const user = await registerUser(db, parsed.data);
    return NextResponse.json(authUserResponseSchema.parse({ user }), { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.status, error.code, error.message);
    console.error("register error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}
