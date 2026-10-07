import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readMigrationFiles,
  runMigrations,
  sha256,
  type SqlTemplate,
} from "../../scripts/lib/migrate.mjs";

type Row = { id: string; hash: string };

function makeFakeSql(initialRows: Row[]) {
  const state = {
    appliedSql: [] as string[],
    inserts: [] as unknown[][],
    selectCount: 0,
  };

  const sql = (async () => {
    state.selectCount += 1;
    if (state.selectCount === 1) return initialRows.map((row) => ({ ...row }));
    return [];
  }) as unknown as SqlTemplate;

  sql.unsafe = async (query: string) => {
    state.appliedSql.push(query);
  };

  sql.begin = async <T>(cb: (tx: SqlTemplate) => Promise<T>): Promise<T> => {
    const tx = (async (...args: unknown[]) => {
      state.inserts.push(args.slice(1));
      return [];
    }) as unknown as SqlTemplate;
    tx.unsafe = async (query: string) => {
      state.appliedSql.push(query);
    };
    return cb(tx);
  };

  return { sql, state };
}

describe("runner de migraciones (librería)", () => {
  it("lee el journal y calcula el hash del SQL", () => {
    const files = readMigrationFiles(path.join("tests", "fixtures", "migrations"));
    expect(files).toHaveLength(1);
    expect(files[0]?.id).toBe("0");
    expect(files[0]?.tag).toBe("0000_init");
    expect(files[0]?.hash).toBe(sha256(files[0]?.sql ?? ""));
    expect(files[0]?.hash).toHaveLength(64);
  });

  it("aplica la migración pendiente y registra id, tag y hash", async () => {
    const { sql, state } = makeFakeSql([]);
    const results = await runMigrations(sql, path.join("tests", "fixtures", "migrations"));
    expect(results).toEqual([{ id: "0", tag: "0000_init", status: "applied" }]);
    expect(state.appliedSql[0]).toContain("schema_migrations");
    expect(state.appliedSql[1]).toContain("fixture_demo");
    expect(state.inserts[0]).toEqual(["0", "0000_init", sha256("create table fixture_demo (id text primary key);\n")]);
  });

  it("omite la migración ya aplicada con el mismo hash", async () => {
    const files = readMigrationFiles(path.join("tests", "fixtures", "migrations"));
    const { sql, state } = makeFakeSql([{ id: "0", hash: files[0]?.hash ?? "" }]);
    const results = await runMigrations(sql, path.join("tests", "fixtures", "migrations"));
    expect(results).toEqual([{ id: "0", tag: "0000_init", status: "skipped" }]);
    expect(state.appliedSql).toHaveLength(1);
    expect(state.inserts).toHaveLength(0);
  });

  it("falla si una migración ya aplicada fue editada (hash distinto)", async () => {
    const { sql } = makeFakeSql([{ id: "0", hash: "hash-antiguo-distinto" }]);
    await expect(
      runMigrations(sql, path.join("tests", "fixtures", "migrations")),
    ).rejects.toThrow(/crear una nueva migración/);
  });

  it("falla ante un journal inválido", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "journal-"));
    writeFileSync(path.join(dir, "journal.json"), '{"version":5}', "utf8");
    expect(() => readMigrationFiles(dir)).toThrow(/entries/);
  });
});
