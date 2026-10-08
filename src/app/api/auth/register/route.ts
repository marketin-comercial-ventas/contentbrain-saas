// @ts-nocheck
import { NextResponse } from "next/server";
import { clientIp, jsonError } from "@/modules/identity/http";
import { rateLimit } from "@/modules/identity/rate-limit";
import { AuthError, registerUser } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";

export async function POST(request: Request): Promise<NextResponse> {
  const limit = rateLimit(`register:${clientIp(request)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError(429, "RATE_LIMITED", "Demasiadas solicitudes, intenta más tarde");
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Cuerpo JSON inválido");
  }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name || name.length > 100) {
    return jsonError(400, "VALIDATION", "Nombre inválido");
  }
  if (!email || email.length > 254 || !email.includes("@")) {
    return jsonError(400, "VALIDATION", "Correo inválido");
  }
  if (password.length < 8 || password.length > 200) {
    return jsonError(400, "VALIDATION", "La contraseña debe tener al menos 8 caracteres");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const { db, client } = createDb(url);
  try {
    const user = await registerUser(db, { name, email, password });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return jsonError(error.status, error.code, error.message);
    console.error("register error", error);
    return jsonError(500, "INTERNAL", "Error interno del servidor");
  } finally {
    await client.end({ timeout: 1 });
  }
}
