// @ts-nocheck
import { NextResponse } from "next/server";
import {
  clientIp,
  jsonError,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { AuthError, loginUser } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";

export async function POST(request: Request): Promise<NextResponse> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Cuerpo JSON inválido");
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return jsonError(400, "VALIDATION", "Correo y contraseña requeridos");
  }
  const limit = rateLimit(`login:${clientIp(request)}:${email}`, {
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
    const { user, token } = await loginUser(db, { email, password });
    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.status, error.code, error.message);
    console.error("login error", error);
    return jsonError(500, "INTERNAL", "Error interno del servidor");
  } finally {
    await client.end({ timeout: 1 });
  }
}
