import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq, and, or, desc, asc, count, sql, gt, lt, gte, lte, ne, inArray, isNull, isNotNull, like, ilike, SQL } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

export { eq, and, or, desc, asc, count, sql, gt, lt, gte, lte, ne, inArray, isNull, isNotNull, like, ilike };

export function createDb(connectionString: string): { db: Db; client: postgres.Sql } {
  const client = postgres(connectionString, { max: 1, prepare: false, onnotice: () => {} });
  const db = drizzle(client, { schema });
  return { db, client };
}

/**
 * Crea una conexión con contexto RLS (company_id + user_id) para una request específica.
 * Las variables de sesión se usan en las RLS policies.
 */
export function createDbWithContext(
  connectionString: string,
  companyId: string | null,
  userId: string | null
): { db: Db; client: postgres.Sql } {
  const client = postgres(connectionString, { max: 1, prepare: false, onnotice: () => {} });
  
  // Setear variables de sesión para RLS
  if (companyId) {
    client.unsafe(`SET LOCAL app.current_company_id = '${companyId}'`);
  } else {
    client.unsafe(`SET LOCAL app.current_company_id = '00000000-0000-0000-0000-000000000000'`);
  }
  
  if (userId) {
    client.unsafe(`SET LOCAL app.current_user_id = '${userId}'`);
  } else {
    client.unsafe(`SET LOCAL app.current_user_id = '00000000-0000-0000-0000-000000000000'`);
  }
  
  const db = drizzle(client, { schema });
  return { db, client };
}

let _defaultDb: Db | null = null;
let _defaultClient: postgres.Sql | null = null;

export function getDefaultDb(): Db {
  if (!_defaultDb) {
    const url = process.env.DATABASE_URL!;
    const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
    _defaultClient = client;
    _defaultDb = drizzle(client, { schema });
  }
  return _defaultDb;
}

export function getDefaultClient(): postgres.Sql {
  if (!_defaultClient) {
    getDefaultDb();
  }
  return _defaultClient!;
}

export const db = getDefaultDb();