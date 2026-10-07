// @ts-nocheck
import { NextResponse } from "next/server";
import { jsonError, readSessionCookie } from "@/modules/identity/http";
import { getUserByToken } from "@/modules/identity/service";
import { createDb } from "@/server/db/client";
import { authUserResponseSchema } from "@/shared/contracts/auth";

export async function GET(request: Request): Promise<NextResponse> {
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError(500, "DB_CONFIG", "DATABASE_URL no definido");
  const token = readSessionCookie(request);
  const { db, client } = createDb(url);
  try {
    const user = await getUserByToken(db, token);
    if (!user) return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");
    return NextResponse.json(authUserResponseSchema.parse({ user }));
  } catch (error) {
    console.error("me error", error);
    return jsonError(500, "INTERNAL", "Error interno");
  } finally {
    await client.end({ timeout: 1 });
  }
}

