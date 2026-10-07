import { randomBytes } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import postgres from "postgres";
import { loadLocalEnv } from "./load-env.mjs";

async function startFromService() {
  const adminUrl = process.env.TEST_DATABASE_URL;
  if (!adminUrl) throw new Error("TEST_DATABASE_URL no definido");

  const admin = postgres(adminUrl, { max: 1, prepare: false });
  const stamp = `${Date.now()}_${randomBytes(3).toString("hex")}`;
  const mainName = `app_test_${stamp}`;
  const migrationsName = `app_test_empty_${stamp}`;
  const created = [];

  try {
    for (const name of [mainName, migrationsName]) {
      await admin.unsafe(`create database "${name}"`);
      created.push(name);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    for (const name of created) await admin.unsafe(`drop database if exists "${name}"`);
    await admin.end({ timeout: 1 });
    throw new Error(
      `No se pudieron crear las bases de pruebas dedicadas en el servicio PostgreSQL (${message}). ` +
        "Comprueba que el servicio esté activo y TEST_DATABASE_URL sea válido.",
    );
  }

  const mainUrl = new URL(adminUrl);
  mainUrl.pathname = `/${mainName}`;
  const migrationsUrl = new URL(adminUrl);
  migrationsUrl.pathname = `/${migrationsName}`;
  console.log(
    `[integration] bases dedicadas por ejecución: ${mainName} (suite) y ${migrationsName} (pipeline de migraciones)`,
  );

  return {
    env: {
      DATABASE_URL: mainUrl.toString(),
      MIGRATIONS_DATABASE_URL: migrationsUrl.toString(),
    },
    stop: async () => {
      for (const name of [mainName, migrationsName]) {
        await admin`
          select pg_terminate_backend(pid)
          from pg_stat_activity
          where datname = ${name} and pid <> pg_backend_pid()`;
        await admin.unsafe(`drop database if exists "${name}"`);
        console.log(`[integration] base eliminada: ${name}`);
      }
      await admin.end({ timeout: 1 });
    },
  };
}

async function startEmbedded() {
  const dataDir = mkdtempSync(path.join(tmpdir(), "pg-f00-"));
  const port = 55000 + Math.floor(Math.random() * 2000);
  const user = "postgres";
  const password = process.env.PG_EMBEDDED_PASSWORD ?? "pgdev";
  const database = "app_test";
  const migrationsDatabase = "app_test_empty";

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user,
    password,
    port,
    persistent: false,
    initdbFlags: ["--encoding=UTF8"],
    onLog: () => {},
    onError: (message) => console.error("[postgres]", message),
  });

  try {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase(database);
    await pg.createDatabase(migrationsDatabase);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await pg.stop();
    } catch {
      /* el proceso puede no haber arrancado */
    }
    rmSync(dataDir, { recursive: true, force: true });
    throw new Error(
      `No se pudo arrancar embedded-postgres (${message}). En Windows, PostgreSQL no arranca ` +
        "desde una sesión de administrador: define TEST_DATABASE_URL hacia un servicio " +
        "PostgreSQL local (ver .env.example) o ejecuta desde una terminal no elevada.",
    );
  }

  const base = `postgres://${user}:${password}@127.0.0.1:${port}`;
  console.log(`[integration] embedded-postgres aislado en ${base}/${database}`);

  return {
    env: {
      DATABASE_URL: `${base}/${database}`,
      MIGRATIONS_DATABASE_URL: `${base}/${migrationsDatabase}`,
    },
    stop: async () => {
      await pg.stop();
      rmSync(dataDir, { recursive: true, force: true });
      console.log("[integration] embedded-postgres detenido y datos eliminados");
    },
  };
}

/**
 * Crea las bases dedicadas de la suite de integración y devuelve las
 * variables de entorno para los tests junto con la función de limpieza.
 *
 * NOTA: `embedded-postgres` no debe importarse dentro del proceso de Vitest:
 * su importación resetea el exit code y ocultaría fallos. Por eso la vida de
 * las bases vive en este orquestador (scripts/run-integration.mjs) y los
 * tests solo reciben DATABASE_URL/MIGRATIONS_DATABASE_URL por entorno.
 */
export async function startIntegrationDb() {
  loadLocalEnv();
  if (process.env.TEST_DATABASE_URL) {
    return startFromService();
  }
  return startEmbedded();
}
