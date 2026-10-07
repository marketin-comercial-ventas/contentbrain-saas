import { createDb } from "@/server/db/client";
import { config } from "dotenv";
config({ path: ".env.local" });

async function check() {
  const { db, client } = createDb(process.env.TEST_DATABASE_URL!);
  const result = await db.execute("SELECT datname, datdba FROM pg_database WHERE datname = 'app_development'");
  console.log("DB info:", result.rows);
  
  // Check if postgres user can connect to app_development
  const { db: db2, client: client2 } = createDb("postgres://postgres:PgTest!2026@127.0.0.1:5432/app_development");
  try {
    await db2.execute("SELECT 1");
    console.log("Can connect to app_development as postgres: YES");
  } catch (e: any) {
    console.log("Can connect to app_development as postgres: NO -", e.message);
  }
  await client2.end();
  await client.end();
}

check();