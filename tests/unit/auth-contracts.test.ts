import { describe, expect, it } from "vitest";
import {
  loginInputSchema,
  PUBLIC_USER_KEYS,
  publicUserSchema,
  registerInputSchema,
  resetInputSchema,
} from "@/shared/contracts/auth";

describe("esquemas compartidos de autenticación", () => {
  it("registro acepta datos válidos y rechaza cortos o con correo inválido", () => {
    const valid = registerInputSchema.safeParse({
      email: "  Ana@Ejemplo.COM ",
      password: "clave-larga-1",
      name: " Ana ",
    });
    expect(valid.success).toBe(true);
    expect(registerInputSchema.safeParse({ email: "no-correo", password: "clave-larga-1", name: "Ana" }).success).toBe(false);
    expect(registerInputSchema.safeParse({ email: "a@b.co", password: "corto", name: "Ana" }).success).toBe(false);
    expect(registerInputSchema.safeParse({ email: "a@b.co", password: "clave-larga-1", name: "   " }).success).toBe(false);
  });

  it("login exige correo y contraseña presentes", () => {
    expect(loginInputSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
    expect(loginInputSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginInputSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
  });

  it("reset exige token y contraseña de al menos 8 caracteres", () => {
    expect(resetInputSchema.safeParse({ token: "t".repeat(30), password: "clave-larga-1" }).success).toBe(true);
    expect(resetInputSchema.safeParse({ token: "corto", password: "clave-larga-1" }).success).toBe(false);
    expect(resetInputSchema.safeParse({ token: "t".repeat(30), password: "corto" }).success).toBe(false);
  });

  it("el usuario público nunca incluye password_hash", () => {
    expect(PUBLIC_USER_KEYS).not.toContain("passwordHash");
    expect(publicUserSchema.safeParse({ id: crypto.randomUUID(), email: "a@b.co", name: "Ana", status: "active", passwordHash: "scrypt$x" }).success).toBe(true);
    expect(Object.keys(publicUserSchema.parse({ id: crypto.randomUUID(), email: "a@b.co", name: "Ana", status: "active" }))).toEqual([...PUBLIC_USER_KEYS]);
  });
});
