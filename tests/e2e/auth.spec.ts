import { expect, test } from "@playwright/test";

const stamp = Date.now();

test("registro, login con cookie segura, sesión activa y logout", async ({ request }) => {
  const email = `e2e-flow-${stamp}@ejemplo.com`;
  const register = await request.post("/api/auth/register", {
    data: { email, password: "clave-segura-123", name: "E2E" },
  });
  expect(register.status()).toBe(201);
  const created = await register.json();
  expect(Object.keys(created.user).sort()).toEqual(["email", "id", "name", "status"]);
  expect(JSON.stringify(created)).not.toContain("passwordHash");

  const duplicate = await request.post("/api/auth/register", {
    data: { email, password: "clave-segura-123", name: "E2E" },
  });
  expect(duplicate.status()).toBe(409);

  const anon = await request.get("/api/auth/me");
  expect(anon.status()).toBe(401);

  const login = await request.post("/api/auth/login", {
    data: { email, password: "clave-segura-123" },
  });
  expect(login.status()).toBe(200);
  const setCookie = login.headers()["set-cookie"] ?? "";
  expect(setCookie.toLowerCase()).toContain("httponly");
  expect(setCookie.toLowerCase()).toContain("samesite=lax");
  expect(setCookie.toLowerCase()).toContain("path=/");
  expect(setCookie.toLowerCase()).toContain("secure");
  // El jar de cookies de APIRequestContext descarta cookies Secure sobre
  // http://127.0.0.1, así que la cookie recibida se reenvía explícitamente.
  const sessionCookie = setCookie.split(";")[0] ?? "";
  expect(sessionCookie).toContain("session=");

  const me = await request.get("/api/auth/me", { headers: { cookie: sessionCookie } });
  expect(me.status()).toBe(200);
  const body = await me.json();
  expect(body.user.email).toBe(email);

  const logout = await request.post("/api/auth/logout", { headers: { cookie: sessionCookie } });
  expect(logout.status()).toBe(200);

  const afterLogout = await request.get("/api/auth/me", { headers: { cookie: sessionCookie } });
  expect(afterLogout.status()).toBe(401);
});

test("credenciales incorrectas devuelven 401 sin revelar existencia de la cuenta", async ({
  request,
}) => {
  const known = `e2e-known-${stamp}@ejemplo.com`;
  await request.post("/api/auth/register", {
    data: { known, password: "clave-segura-123", name: "Conocido" },
  });

  const wrongPassword = await request.post("/api/auth/login", {
    data: { email: known, password: "incorrecta-123" },
  });
  const unknownUser = await request.post("/api/auth/login", {
    data: { email: `e2e-unknown-${stamp}@ejemplo.com`, password: "incorrecta-123" },
  });
  expect(wrongPassword.status()).toBe(401);
  expect(unknownUser.status()).toBe(401);
  expect(await wrongPassword.json()).toEqual(await unknownUser.json());
});

test("POST con Origin distinto del host se rechaza con 403", async ({ request }) => {
  const response = await request.post("/api/auth/login", {
    data: { email: `e2e-origin-${stamp}@ejemplo.com`, password: "clave-segura-123" },
    headers: { origin: "https://evil.example" },
  });
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body.error.code).toBe("BAD_ORIGIN");
});

test("el rate limit responde 429 tras los intentos de login permitidos", async ({ request }) => {
  const email = `e2e-ratelimit-${stamp}@ejemplo.com`;
  let last = 0;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    const response = await request.post("/api/auth/login", {
      data: { email, password: "incorrecta-123" },
    });
    last = response.status();
    if (attempt < 10) expect(last).toBe(401);
  }
  expect(last).toBe(429);
});

test("forgot responde 200 sin token en producción y reset rechaza token inválido", async ({
  request,
}) => {
  const forgot = await request.post("/api/auth/forgot", {
    data: { email: `e2e-forgot-${stamp}@ejemplo.com` },
  });
  expect(forgot.status()).toBe(200);
  const body = await forgot.json();
  expect(body.ok).toBe(true);
  expect(body).not.toHaveProperty("devToken");

  const reset = await request.post("/api/auth/reset", {
    data: { token: "t".repeat(40), password: "clave-nueva-123" },
  });
  expect(reset.status()).toBe(400);
  expect((await reset.json()).error.code).toBe("INVALID_TOKEN");
});

test("entrada inválida responde 400 con error controlado", async ({ request }) => {
  const response = await request.post("/api/auth/register", {
    data: { email: "no-es-correo", password: "corto", name: "" },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).error.code).toBe("VALIDATION");
});

test("las pantallas de auth son utilizables en viewport móvil (375px)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await page.goto("/registro");
  await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();
});
