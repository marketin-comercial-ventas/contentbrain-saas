import { spawnSync } from "node:child_process";
import { startIntegrationDb } from "./lib/integration-db.mjs";

const db = await startIntegrationDb();
let status = 1;
try {
  const result = spawnSync(
    "pnpm",
    ["exec", "vitest", "run", "--config", "vitest.integration.config.mts"],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, ...db.env },
    },
  );
  status = result.status ?? 1;
  if (result.error) {
    console.error(`no se pudo ejecutar vitest: ${result.error.message}`);
    status = 1;
  }
} finally {
  try {
    await db.stop();
  } catch (error) {
    console.error("limpieza de bases de pruebas fallida:", error);
  }
}
process.exit(status);
