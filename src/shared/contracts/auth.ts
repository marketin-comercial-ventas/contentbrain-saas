import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

export const registerInputSchema = z.object({
  email: emailField,
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(100),
});

export const loginInputSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(200),
});

export const forgotInputSchema = z.object({
  email: emailField,
});

export const resetInputSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(200),
});

export const publicUserSchema = z.object({
  id: z.uuid(),
  email: z.string().min(1),
  name: z.string().min(1),
  status: z.string().min(1),
});

export const authUserResponseSchema = z.object({ user: publicUserSchema });
export const okResponseSchema = z.object({ ok: z.literal(true) });
export const forgotResponseSchema = z.object({
  ok: z.literal(true),
  devToken: z.string().optional(),
});

export const authErrorSchema = z.object({
  error: z.object({ code: z.string().min(1), message: z.string().min(1) }),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

export const PUBLIC_USER_KEYS = ["id", "email", "name", "status"] as const;
