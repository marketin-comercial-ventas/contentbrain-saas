import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

dns.setDefaultResultOrder("ipv6first");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2];
if (!url) {
  console.error("Usage: node run-migrations.mjs <DATABASE_URL>");
  process.exit(1);
}

const sql = postgres(url, { max: 1, ssl: "require" });

const files = [
  "0000_wealthy_triathlon.sql",
  "0001_spicy_thunderbolts.sql",
  "0002_old_warlock.sql",
  "0003_f02_rls_policies.sql",
  "0004_f03_company_brain_extended.sql",
  "0005_f04_catalog_advanced.sql",
  "0006_f05_audiences_advanced.sql",
  "0007_f06_rules_engine.sql",
  "0008_f07_ai_core_extended.sql",
  "0009_mighty_nightcrawler.sql",
];

for (const file of files) {
  const filePath = path.join(__dirname, "..", "drizzle", file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP ${file} (not found)`);
    continue;
  }
  const sqlText = fs.readFileSync(filePath, "utf8");
  console.log(`Running ${file}...`);
  try {
    await sql.unsafe(sqlText);
    console.log(`  OK`);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  }
}
await sql.end();
console.log("Done.");
