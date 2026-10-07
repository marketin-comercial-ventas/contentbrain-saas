import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { auditEvents, sessions, users } from "@/server/db/schema";
import { createDb } from "@/server/db/client";
import {
  AuthError,
  getUserByToken,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/modules/identity/service";
import { runMigrations } from "../../scripts/lib/migrate.mjs";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL no definido: ejecuta la suite con `pnpm test:integration` (orquestador scripts/run-integration.mjs)",
  );
}

const stamp = Date.now();

describe("identidad sobre PostgreSQL real", () => {
  const { db, client } = createDb(url);

  beforeAll(async () => {
    await runMigrations(client, "drizzle");
  });

  afterAll(async () => {
    await client.end({ timeout: 1 });
  });

  it("el registro crea el usuario con contraseña hasheada y sin claro en BD", async () => {
    const user = await registerUser(db, {
      email: `Ana${stamp}@Ejemplo.COM`,
      password: "clave-segura-123",
      name: "Ana",
    });
    expect(user.email).toBe(`ana${stamp}@ejemplo.com`);
    expect(user).not.toHaveProperty("passwordHash");

    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    expect(row?.passwordHash.startsWith("scrypt$")).toBe(true);
    expect(row?.passwordHash).not.toContain("clave-segura-123");
  });

  it("un email duplicado se rechaza con 409", async () => {
    await registerUser(db, {
      email: `dup${stamp}@ejemplo.com`,
      password: "clave-segura-123",
      name: "Duplicado",
    });
    const error = await registerUser(db, {
      email: `dup${stamp}@ejemplo.com`,
      password: "otra-clave-123",
      name: "Otra",
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AuthError);
    expect((error as AuthError).status).toBe(409);
    expect((error as AuthError).code).toBe("EMAIL_TAKEN");
  });

  it("login crea sesión con token hasheado en BD (nunca el token en claro)", async () => {
    const email = `login${stamp}@ejemplo.com`;
    await registerUser(db, { email, password: "clave-segura-123", name: "Login" });
    const { user, token } = await loginUser(db, { email, password: "clave-segura-123" });
    expect(user.email).toBe(email);

    const stored = await db
      .select({ hash: sessions.tokenHash })
      .from(sessions)
      .where(eq(sessions.userId, user.id));
    expect(stored.length).toBeGreaterThan(0);
    expect(stored.every((row) => row.hash !== token)).toBe(true);
    expect(stored.every((row) => !row.hash.includes(token))).toBe(true);

    const me = await getUserByToken(db, token);
    expect(me?.id).toBe(user.id);
  });

  it("login con contraseña incorrecta devuelve 401 y audita el fallo", async () => {
    const email = `fail${stamp}@ejemplo.com`;
    await registerUser(db, { email, password: "clave-segura-123", name: "Fallo" });
    const error = await loginUser(db, { email, password: "incorrecta-123" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(AuthError);
    expect((error as AuthError).status).toBe(401);

    const failed = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.event, "auth.login_failed"));
    expect(failed.length).toBeGreaterThan(0);
  });

  it("logout revoca la sesión: el token deja de ser válido", async () => {
    const email = `logout${stamp}@ejemplo.com`;
    await registerUser(db, { email, password: "clave-segura-123", name: "Logout" });
    const { token } = await loginUser(db, { email, password: "clave-segura-123" });
    expect(await getUserByToken(db, token)).not.toBeNull();
    await logoutUser(db, token);
    expect(await getUserByToken(db, token)).toBeNull();
    expect(await getUserByToken(db, undefined)).toBeNull();
  });

  it("recuperación: reset cambia la contraseña, marca el token usado y revoca todas las sesiones", async () => {
    const email = `reset${stamp}@ejemplo.com`;
    await registerUser(db, { email, password: "clave-segura-123", name: "Reset" });
    const first = await loginUser(db, { email, password: "clave-segura-123" });
    const second = await loginUser(db, { email, password: "clave-segura-123" });

    const token = await requestPasswordReset(db, email);
    expect(token).not.toBeNull();
    expect(await requestPasswordReset(db, `noexiste${stamp}@ejemplo.com`)).toBeNull();

    await resetPassword(db, { token: token as string, password: "nueva-clave-456" });

    expect(await getUserByToken(db, first.token)).toBeNull();
    expect(await getUserByToken(db, second.token)).toBeNull();
    await expect(loginUser(db, { email, password: "clave-segura-123" })).rejects.toMatchObject({
      status: 401,
    });
    const ok = await loginUser(db, { email, password: "nueva-clave-456" });
    expect(ok.user.email).toBe(email);

    const reuse = await resetPassword(db, { token: token as string, password: "otra-clave-789" }).catch(
      (e: unknown) => e,
    );
    expect(reuse).toBeInstanceOf(AuthError);
    expect((reuse as AuthError).code).toBe("INVALID_TOKEN");
  });

  it("audita los eventos de alta y reset", async () => {
    const events = await db
      .select({ event: auditEvents.event })
      .from(auditEvents);
    const names = new Set(events.map((row) => row.event));
    expect(names.has("user.registered")).toBe(true);
    expect(names.has("auth.login_ok")).toBe(true);
    expect(names.has("auth.login_failed")).toBe(true);
    expect(names.has("auth.reset_requested")).toBe(true);
    expect(names.has("auth.password_reset")).toBe(true);
  });

  it("las tablas de F01 existen y son consultables", async () => {
    const rows = await client`
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('users', 'sessions', 'password_reset_tokens', 'audit_events')`;
    expect(rows).toHaveLength(4);
    const count = await db.select({ n: sql<number>`count(*)` }).from(users);
    expect(Number(count[0]?.n)).toBeGreaterThan(0);
  });
});
