import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const CREATE_TABLE_SQL = `
create table if not exists schema_migrations (
  id text primary key,
  name text not null,
  hash text not null,
  applied_at timestamptz not null default now()
);
`;

export const STATEMENT_BREAKPOINT = "--> statement-breakpoint";

export function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function resolveJournalPath(outDir) {
  const candidates = [path.join(outDir, "meta", "_journal.json"), path.join(outDir, "journal.json")];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`journal no encontrado en ${outDir} (busqué meta/_journal.json y journal.json)`);
}

export function splitStatements(sql) {
  return sql
    .split(STATEMENT_BREAKPOINT)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

export function readMigrationFiles(outDir) {
  const journalPath = resolveJournalPath(outDir);
  const journal = JSON.parse(readFileSync(journalPath, "utf8"));
  if (!Array.isArray(journal.entries)) {
    throw new Error(`journal inválido en ${journalPath}: falta entries[]`);
  }
  return journal.entries.map((entry) => {
    const file = path.join(outDir, `${entry.tag}.sql`);
    const raw = readFileSync(file, "utf8");
    return {
      id: String(entry.idx),
      tag: entry.tag,
      sql: raw,
      statements: splitStatements(raw),
      hash: sha256(raw),
    };
  });
}

export async function runMigrations(sql, outDir, log = () => {}) {
  await sql.unsafe(CREATE_TABLE_SQL);
  const rows = await sql`select id, hash from schema_migrations`;
  const applied = new Map(rows.map((row) => [String(row.id), row.hash]));
  const results = [];
  for (const migration of readMigrationFiles(outDir)) {
    const previousHash = applied.get(migration.id);
    if (previousHash !== undefined) {
      if (previousHash !== migration.hash) {
        throw new Error(
          `migración ${migration.id} (${migration.tag}) ya aplicada con hash ${previousHash} ≠ ${migration.hash}: crear una nueva migración, no editarla`,
        );
      }
      results.push({ id: migration.id, tag: migration.tag, status: "skipped" });
      continue;
    }
    await sql.begin(async (tx) => {
      for (const statement of migration.statements) {
        await tx.unsafe(statement);
      }
      await tx`insert into schema_migrations (id, name, hash) values (${migration.id}, ${migration.tag}, ${migration.hash})`;
    });
    results.push({ id: migration.id, tag: migration.tag, status: "applied" });
    log(`applied ${migration.id} ${migration.tag}`);
  }
  return results;
}
