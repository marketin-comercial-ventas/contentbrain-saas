import { expect, test } from "@playwright/test";
import { healthResponseSchema } from "../../src/shared/contracts/health";

test("la página principal responde 200 y muestra el encabezado", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /Plataforma Growth · Sales · Talent/ }),
  ).toBeVisible();
});

test("GET /api/health cumple el contrato compartido", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const body = await response.json();
  const parsed = healthResponseSchema.safeParse(body);
  expect(parsed.success).toBe(true);
  expect(Object.keys(body).sort()).toEqual(["service", "status", "timestamp", "version"]);
});

test("cabeceras de seguridad presentes en la respuesta", async ({ request }) => {
  const response = await request.get("/api/health");
  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});
