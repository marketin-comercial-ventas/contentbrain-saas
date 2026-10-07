import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HEALTH_RESPONSE_KEYS } from "@/shared/contracts/health";
import { buildHealthPayload } from "@/shared/health/payload";

const ROOT = process.cwd();

function walk(dir: string, extensions: string[], skip: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (skip.includes(entry)) continue;
    const full = path.join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      results.push(...walk(full, extensions, skip));
    } else if (extensions.some((extension) => entry.endsWith(extension))) {
      results.push(full);
    }
  }
  return results;
}

describe("superficie de seguridad inicial", () => {
  it("no hay secretos literales en src/ ni scripts/", () => {
    const files = [
      ...walk(path.join(ROOT, "src"), [".ts", ".tsx"], ["node_modules"]),
      ...walk(path.join(ROOT, "scripts"), [".mjs"], ["node_modules"]),
    ];
    const secretPattern =
      /(api[_-]?key|secret|passwd|password|private[_-]?key|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9+/_-]{8,}["']/i;
    const offenders = files.filter((file) => secretPattern.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
    expect(files.length).toBeGreaterThan(5);
  });

  it("el payload de salud expone únicamente el contrato público", () => {
    const payload = buildHealthPayload("0.1.0", new Date());
    expect(Object.keys(payload).sort()).toEqual([...HEALTH_RESPONSE_KEYS].sort());
    expect(payload).not.toHaveProperty("env");
    expect(payload).not.toHaveProperty("uptime");
    expect(payload).not.toHaveProperty("pid");
  });

  it("la UI no lee variables de entorno directamente (server/cliente separados)", () => {
    const uiFiles = walk(path.join(ROOT, "src", "app"), [".tsx"], ["api"]);
    expect(uiFiles.length).toBeGreaterThan(0);
    const offenders = uiFiles.filter((file) => readFileSync(file, "utf8").includes("process.env"));
    expect(offenders).toEqual([]);
  });

  it("el bundle de cliente no contiene la cadena de conexión ni process.env de servidor", () => {
    const staticDir = path.join(ROOT, ".next", "static");
    if (!existsSync(staticDir)) {
      throw new Error(
        "build ausente: ejecuta `pnpm build` antes de `pnpm test:security` (no se omite esta comprobación)",
      );
    }
    const chunks = walk(staticDir, [".js"], []);
    expect(chunks.length).toBeGreaterThan(0);
    const offenders = chunks.filter((chunk) => {
      const content = readFileSync(chunk, "utf8");
      return content.includes("DATABASE_URL") || content.includes("process.env.DATABASE_URL");
    });
    expect(offenders).toEqual([]);
  });
});
