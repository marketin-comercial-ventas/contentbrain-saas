import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";
import { loadLocalEnv } from "../../scripts/lib/load-env.mjs";

loadLocalEnv();

async function setupFromService(): Promise<() => Promise<void>> {
  const adminUrl = process.env.TEST_DATABASE_URL;
  if (!adminUrl) throw new Error("TEST_DATABASE_URL no definido");

  const admin = postgres(adminUrl, { max: 1, prepare: false });
  const dbName = `app_test_${Date.now()}_${randomBytes(3).toString("hex")}`;

  try {
    await admin.unsafe(`create database "${dbName}"`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo crear la base de pruebas dedicada en el servicio PostgreSQL (${message}). ` +
        "Comprueba que el servicio esté activo y TEST_DATABASE_URL sea válido.",
    );
  }

  const target = new URL(adminUrl);
  target.pathname = `/${dbName}`;
  process.env.DATABASE_URL = target.toString();
  console.log(`[integration] base dedicada por ejecución: ${dbName}`);

  return async () => {
    try {
      await admin`
        select pg_terminate_backend(pid)
        from pg_stat_activity
        where datname = ${dbName} and pid <> pg_backend_pid()`;
      await admin.unsafe(`drop database if exists "${dbName}"`);
      console.log(`[integration] base eliminada: ${dbName}`);
    } finally {
      await admin.end({ timeout: 1 });
    }
  };
}

async function setupEmbedded(): Promise<() => Promise<void>> {
  const dataDir = mkdtempSync(path.join(tmpdir(), "pg-f00-"));
  const port = 55000 + Math.floor(Math.random() * 2000);
  const user = "postgres";
  const password = "password";
  const database = "app_test";

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user,
    password,
    port,
    persistent: false,
    initdbFlags: ["--encoding=UTF8"],
    onLog: () => {},
    onError: (message: unknown) => console.error("[postgres]", message),
  });

  try {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase(database);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo arrancar embedded-postgres (${message}). En Windows, PostgreSQL no arranca ` +
        "desde una sesión de administrador: define TEST_DATABASE_URL hacia un servicio " +
        "PostgreSQL local (ver .env.example) o ejecuta desde una terminal no elevada.",
    );
  }

  process.env.DATABASE_URL = `postgres://${user}:${password}@127.0.0.1:${port}/${database}`;
  console.log(`[integration] embedded-postgres aislado en 127.0.0.1:${port}/${database}`);

  return async () => {
    await pg.stop();
    rmSync(dataDir, { recursive: true, force: true });
  };
}

export default async function globalSetup() {
  if (process.env.TEST_DATABASE_URL) {
    return setupFromService();
  }
  return setupEmbedded();
}
