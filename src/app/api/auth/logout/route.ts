import { NextResponse } from "next/server";
import {
  isSameOrigin,
  jsonError,
  readSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/modules/identity/http";
import { logoutUser } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { okResponseSchema } from "@/shared/contracts/auth";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return jsonError(403, "BAD_ORIGIN", "Origen no permitido");
  }
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const token = readSessionCookie(request);
  const { db, client } = createDb(url);
  try {
    await logoutUser(db, token);
    const response = NextResponse.json(okResponseSchema.parse({ ok: true }));
    response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
    return response;
  } catch (error) {
    console.error("logout error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}
