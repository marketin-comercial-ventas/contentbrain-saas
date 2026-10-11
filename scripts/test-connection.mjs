import postgres from "postgres";

const url = process.argv[2];
console.log("Connecting to:", url.replace(/:[^:@]+@/, ":***@"));

try {
  const sql = postgres(url, { max: 1, ssl: "require", connect_timeout: 15 });
  const r = await sql`SELECT 1 as ok`;
  console.log("CONNECTED:", r);
  await sql.end();
} catch (e) {
  console.error("ERROR:", e.message);
}
