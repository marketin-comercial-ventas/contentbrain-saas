import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

export function createDb(connectionString: string): { db: Db; client: postgres.Sql } {
  const client = postgres(connectionString, { max: 1, prepare: false, onnotice: () => {} });
  const db = drizzle(client, { schema });
  return { db, client };
}
