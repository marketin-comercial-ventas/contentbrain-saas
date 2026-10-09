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

export type CompanyAuthorization =
  | {
      ok: true;
      session: AuthResult;
      membership: { id: string; userId: string; companyId: string; role: string };
    }
  | { ok: false; response: NextResponse };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Autoriza una ruta cuyo alcance viene dado por `companyId` en la URL.
 * Nunca usa la primera empresa de la sesión: comprueba la empresa solicitada
 * y la membresía exacta del usuario antes de permitir la operación.
 */
const ROLE_LEVEL: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export async function authorizeCompanyRequest(
  request: Request,
  companyId: string,
  minimumRole: keyof typeof ROLE_LEVEL = "viewer",
): Promise<CompanyAuthorization> {
  const session = await auth(request);
  if (!session) {
    return {
      ok: false,
      response: jsonError(401, "UNAUTHENTICATED", "Sesión requerida"),
    };
  }

  if (!UUID_PATTERN.test(companyId)) {
    return {
      ok: false,
      response: jsonError(404, "NOT_FOUND", "Empresa no encontrada"),
    };
  }

  const { db } = await import("@/server/db/client");
  const { and, eq } = await import("drizzle-orm");
  const { companies, memberships } = await import("@/server/db/schema");

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    return {
      ok: false,
      response: jsonError(404, "NOT_FOUND", "Empresa no encontrada"),
    };
  }

  const [membership] = await db
    .select({
      id: memberships.id,
      userId: memberships.userId,
      companyId: memberships.companyId,
      role: memberships.role,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, session.user.id),
        eq(memberships.companyId, companyId),
      ),
    )
    .limit(1);

  if (!membership) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "No perteneces a esta empresa"),
    };
  }

  if ((ROLE_LEVEL[membership.role] ?? 0) < ROLE_LEVEL[minimumRole]) {
    return {
      ok: false,
      response: jsonError(403, "FORBIDDEN", "No tienes permisos para esta operación"),
    };
  }

  return { ok: true, session, membership };
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