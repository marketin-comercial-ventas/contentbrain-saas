import postgres from "postgres";
import { loadLocalEnv } from "./lib/load-env.mjs";
import { runMigrations } from "./lib/migrate.mjs";

loadLocalEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL no definido (crear .env.local desde .env.example)");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });
try {
  const results = await runMigrations(sql, "drizzle", (message) => console.log(message));
  const applied = results.filter((result) => result.status === "applied").length;
  const skipped = results.filter((result) => result.status === "skipped").length;
  console.log(`migraciones: ${applied} aplicadas, ${skipped} ya aplicadas, ${results.length} total`);
} catch (error) {
  console.error(`migración fallida: ${error && error.message ? error.message : error}`);
  await sql.end({ timeout: 1 });
  process.exit(1);
}
await sql.end({ timeout: 1 });
