import { NextResponse } from "next/server";
import { createDb } from "@/server/db/client";

const REQUIRED_TABLES = [
  "users",
  "sessions",
  "password_reset_tokens",
  "audit_events",
  "companies",
  "memberships",
] as const;

export async function GET(): Promise<NextResponse> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json(
      { status: "error", code: "DB_CONFIG_MISSING", tables: [] },
      { status: 503 },
    );
  }

  const { client } = createDb(url);
  try {
    await client`select 1`;
    const rows = await client`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ${client(REQUIRED_TABLES)}
      order by table_name
    `;
    const present = new Set(rows.map((row) => String(row.table_name)));
    const missing = REQUIRED_TABLES.filter((table) => !present.has(table));
    if (missing.length > 0) {
      return NextResponse.json(
        { status: "error", code: "DB_MIGRATIONS_MISSING", missing },
        { status: 503 },
      );
    }
    return NextResponse.json({ status: "ok", code: "DB_READY" });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "DB_CONNECTION_FAILED";
    return NextResponse.json(
      { status: "error", code },
      { status: 503 },
    );
  } finally {
    await client.end({ timeout: 1 });
  }
}
