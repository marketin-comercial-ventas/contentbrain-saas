import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { createDb } from "@/server/db/client";
import { appSettings } from "@/server/db/schema";
import { readMigrationFiles, runMigrations, sha256 } from "../../scripts/lib/migrate.mjs";
import fixture from "../fixtures/app-settings.json";

const url = process.env.MIGRATIONS_DATABASE_URL;
if (!url) {
  throw new Error(
    "MIGRATIONS_DATABASE_URL no definido: ejecuta la suite con `pnpm test:integration` (orquestador scripts/run-integration.mjs; la suite de migraciones exige una base vacía propia)",
  );
}

const outDir = "drizzle";

describe("pipeline de migraciones sobre PostgreSQL real aislado", () => {
  const { db, client } = createDb(url);

  afterAll(async () => {
    await client.end({ timeout: 1 });
  });

  it("la suite apunta a su base vacía dedicada por ejecución", async () => {
    const rows = await client`select current_database() as db, current_user as usr`;
    expect(rows[0]?.db).toMatch(/^app_test_/);
    expect(rows[0]?.usr).toBe("postgres");
  });

  it("aplica la migración inicial en una base vacía", async () => {
    const results = await runMigrations(client, outDir);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.status === "applied")).toBe(true);

    const tables = await client`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_name = 'app_settings'`;
    expect(tables).toHaveLength(1);

    const applied = await client`select id, hash from schema_migrations order by id`;
    const expected = readMigrationFiles(outDir);
    expect(applied).toHaveLength(expected.length);
    expect(applied[0]?.hash).toBe(expected[0]?.hash);
    expect(applied[0]?.hash).toBe(sha256(expected[0]?.sql ?? ""));
  });

  it("preserva datos previos y omite la migración ya aplicada", async () => {
    await db.insert(appSettings).values(fixture);
    const results = await runMigrations(client, outDir);
    expect(results.every((result) => result.status === "skipped")).toBe(true);

    const rows = await db.select().from(appSettings);
    expect(rows.map((row) => row.key).sort()).toEqual(fixture.map((f) => f.key).sort());
    const region = rows.find((row) => row.key === "app.region-default");
    expect(region?.value).toEqual({ tz: "America/Mexico_City" });
  });

  it("el cliente Drizzle lee y escribe la tabla real", async () => {
    await db
      .insert(appSettings)
      .values({ key: "smoke.drizzle", value: { ok: true } })
      .onConflictDoUpdate({ target: appSettings.key, set: { value: { ok: true } } });
    const rows = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "smoke.drizzle"));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.value).toEqual({ ok: true });
    await db.delete(appSettings).where(eq(appSettings.key, "smoke.drizzle"));
  });

  it("los archivos de migración del repo están versionados en el journal", () => {
    const files = readMigrationFiles(outDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files[0]?.tag).toMatch(/^\d{4}_/);
  });
});
