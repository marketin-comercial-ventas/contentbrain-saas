import { and, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import {
  auditEvents,
  passwordResetTokens,
  sessions,
  users,
} from "@/server/db/schema";
import type { PublicUser } from "@/shared/contracts/auth";
import { hashPassword, verifyPassword } from "./password";
import { createToken, hashToken, RESET_TTL_MS, SESSION_TTL_MS } from "./tokens";

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current; depth += 1) {
    const candidate = current as { code?: string; message?: string; cause?: unknown };
    if (candidate.code === "23505") return true;
    if (
      typeof candidate.message === "string" &&
      (candidate.message.includes("duplicate key") ||
        candidate.message.includes("llave duplicada"))
    ) {
      return true;
    }
    current = candidate.cause;
  }
  return false;
}

function publicUser(user: { id: string; email: string; name: string; status: string }): PublicUser {
  return { id: user.id, email: user.email, name: user.name, status: user.status };
}

async function recordAudit(
  db: Db,
  userId: string | null,
  event: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await db.insert(auditEvents).values({ userId, event, metadata });
}

let dummyHashPromise: Promise<string> | null = null;

function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword("timing-equalizer-not-a-real-password");
  return dummyHashPromise;
}

export async function registerUser(
  db: Db,
  input: { email: string; password: string; name: string },
): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  let created;
  try {
    [created] = await db
      .insert(users)
      .values({ email, passwordHash, name: input.name.trim() })
      .returning();
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AuthError("EMAIL_TAKEN", 409, "Ya existe una cuenta con ese correo");
    }
    throw error;
  }
  if (!created) throw new AuthError("REGISTER_FAILED", 500, "No se pudo crear la cuenta");
  await recordAudit(db, created.id, "user.registered", { email });
  return publicUser(created);
}

export async function loginUser(
  db: Db,
  input: { email: string; password: string },
): Promise<{ user: PublicUser; token: string }> {
  const email = input.email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const hash = user ? user.passwordHash : await getDummyHash();
  const valid = await verifyPassword(input.password, hash);
  if (!user || !valid || user.status !== "active") {
    await recordAudit(db, user?.id ?? null, "auth.login_failed", { email });
    throw new AuthError("INVALID_CREDENTIALS", 401, "Credenciales incorrectas");
  }
  const token = createToken();
  await db.insert(sessions).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  await recordAudit(db, user.id, "auth.login_ok", {});
  return { user: publicUser(user), token };
}

export async function logoutUser(db: Db, token: string | undefined): Promise<void> {
  if (!token) return;
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(sessions.tokenHash, hashToken(token)), isNull(sessions.revokedAt)),
    );
}

export async function getUserByToken(
  db: Db,
  token: string | undefined,
): Promise<PublicUser | null> {
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    );
  if (!row || row.user.status !== "active") return null;
  return publicUser(row.user);
}

export async function requestPasswordReset(db: Db, email: string): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized));
  if (!user || user.status !== "active") return null;
  const token = createToken();
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });
  await recordAudit(db, user.id, "auth.reset_requested", {});
  return token;
}

export async function resetPassword(
  db: Db,
  input: { token: string; password: string },
): Promise<void> {
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(input.token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );
  if (!row) {
    throw new AuthError("INVALID_TOKEN", 400, "Token inválido o caducado");
  }
  const passwordHash = await hashPassword(input.password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, row.userId), isNull(sessions.revokedAt)));
  await recordAudit(db, row.userId, "auth.password_reset", {});
}
