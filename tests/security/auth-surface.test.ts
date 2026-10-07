import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relative: string): string {
  return readFileSync(path.join(ROOT, relative), "utf8");
}

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

const AUTH_ROUTES = [
  "src/app/api/auth/register/route.ts",
  "src/app/api/auth/login/route.ts",
  "src/app/api/auth/logout/route.ts",
  "src/app/api/auth/me/route.ts",
  "src/app/api/auth/forgot/route.ts",
  "src/app/api/auth/reset/route.ts",
];

const POST_AUTH_ROUTES = AUTH_ROUTES.filter((route) => !route.includes("/me/"));

describe("superficie de autenticación (F01)", () => {
  it("la cookie de sesión es httpOnly, SameSite=Lax y Secure solo en producción", () => {
    const source = read("src/modules/identity/http.ts");
    expect(source).toMatch(/httpOnly:\s*true/);
    expect(source).toMatch(/sameSite:\s*"lax"/);
    expect(source).toMatch(/secure:\s*process\.env\.NODE_ENV\s*===\s*"production"/);
  });

  it("el token de sesión solo se persiste hasheado (sha256)", () => {
    const service = read("src/modules/identity/service.ts");
    expect(service).toContain("tokenHash: hashToken(token)");
    expect(service).not.toMatch(/token:\s*token\b(?![^]*tokenHash)/);
    const tokens = read("src/modules/identity/tokens.ts");
    expect(tokens).toContain('createHash("sha256")');
  });

  it("las contraseñas usan scrypt con comparación de tiempo constante", () => {
    const source = read("src/modules/identity/password.ts");
    expect(source).toContain("scrypt");
    expect(source).toContain("timingSafeEqual");
    expect(source).not.toContain("md5");
    expect(source).not.toContain("sha1");
  });

  it("todas las rutas de auth con POST validan el Origin", () => {
    for (const route of POST_AUTH_ROUTES) {
      const source = read(route);
      expect(source, `${route} debe validar Origin`).toContain("isSameOrigin(request)");
    }
    const me = read("src/app/api/auth/me/route.ts");
    expect(me).toContain("401");
    expect(me).toContain("export async function GET");
    expect(me).not.toContain("export async function POST");
  });

  it("login, forgot y reset aplican rate limiting", () => {
    expect(read("src/app/api/auth/login/route.ts")).toContain("rateLimit(");
    expect(read("src/app/api/auth/forgot/route.ts")).toContain("rateLimit(");
    expect(read("src/app/api/auth/reset/route.ts")).toContain("rateLimit(");
  });

  it("el token de recuperación solo se emite fuera de producción", () => {
    const source = read("src/app/api/auth/forgot/route.ts");
    expect(source).toContain('process.env.NODE_ENV === "production"');
    expect(source).toContain("devToken");
  });

  it("reset revoca todas las sesiones y marca el token como usado", () => {
    const service = read("src/modules/identity/service.ts");
    expect(service).toMatch(/update\(sessions\)[^]*set\(\{ revokedAt:/);
    expect(service).toMatch(/update\(passwordResetTokens\)[^]*set\(\{ usedAt:/);
  });

  it("ninguna respuesta expone password_hash ni el hash de sesión", () => {
    const contract = read("src/shared/contracts/auth.ts");
    expect(contract).toContain("PUBLIC_USER_KEYS");
    expect(contract).not.toContain("passwordHash: z");
    for (const route of AUTH_ROUTES) {
      const source = read(route);
      expect(source, `${route} no debe devolver passwordHash`).not.toContain("passwordHash");
    }
  });

  it("el bundle de cliente no contiene hashes de contraseña ni columnas internas", () => {
    const staticDir = path.join(ROOT, ".next", "static");
    if (!existsSync(staticDir)) {
      throw new Error(
        "build ausente: ejecuta `pnpm build` antes de `pnpm test:security` (no se omite esta comprobación)",
      );
    }
    const chunks = walk(staticDir, [".js"], []);
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      const content = readFileSync(chunk, "utf8");
      expect(content).not.toContain("password_hash");
      expect(content).not.toContain("token_hash");
      expect(content).not.toContain("scrypt$");
    }
  });
});
