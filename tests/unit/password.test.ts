import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/identity/password";

describe("hash de contraseñas con scrypt", () => {
  it("no almacena la contraseña en claro y usa prefijo scrypt", async () => {
    const hash = await hashPassword("MiClave-Segura-123");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("MiClave-Segura-123");
  });

  it("genera hashes distintos para la misma contraseña (salt aleatorio)", async () => {
    const a = await hashPassword("MiClave-Segura-123");
    const b = await hashPassword("MiClave-Segura-123");
    expect(a).not.toBe(b);
  });

  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("MiClave-Segura-123");
    await expect(verifyPassword("MiClave-Segura-123", hash)).resolves.toBe(true);
    await expect(verifyPassword("otra-clave", hash)).resolves.toBe(false);
  });

  it("rechaza hashes con formato inválido sin lanzar excepción", async () => {
    await expect(verifyPassword("x", "no-es-un-hash")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$16384$abc")).resolves.toBe(false);
    await expect(verifyPassword("x", "bcrypt$16384$a$b")).resolves.toBe(false);
  });
});
