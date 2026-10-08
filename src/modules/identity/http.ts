import { NextResponse } from "next/server";

export const SESSION_COOKIE = "session";

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  companyId: string | null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return true;
  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return true;
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl && originHost === vercelUrl) return true;
    if (vercelUrl && host === vercelUrl) return true;
    const vercelProj = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercelProj && originHost === vercelProj) return true;
    return false;
  } catch {
    return true;
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "local";
}

export function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function readSessionCookie(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  companyId: string | null;
}

/**
 * Autentica la request y retorna user + companyId actual (si hay membresía).
 * También setea las variables de sesión RLS en la DB para la duración de la request.
 */
export async function auth(request: Request): Promise<AuthResult | null> {
  const token = readSessionCookie(request);
  if (!token) return null;
  
  const { db } = await import("@/server/db/client");
  const { getUserByToken } = await import("@/modules/identity/service");
  const { memberships } = await import("@/server/db/schema");
  const { eq } = await import("@/server/db/client");
  
  const user = await getUserByToken(db, token);
  if (!user) return null;
  
  const [m] = await db.select({ companyId: memberships.companyId })
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .limit(1);
  
  const companyId = m?.companyId ?? null;
  
  return { user, companyId };
}

/**
 * Crea una instancia de DB con contexto RLS para la request actual.
 * Usar en API routes para que RLS policies filtren automáticamente.
 */
export async function getDbWithRls(request: Request) {
  const authResult = await auth(request);
  if (!authResult) return null;
  
  const { createDbWithContext } = await import("@/server/db/client");
  const databaseUrl = process.env.DATABASE_URL!;
  return createDbWithContext(databaseUrl, authResult.companyId, authResult.user.id);
}