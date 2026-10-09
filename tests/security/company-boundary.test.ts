import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const read = (relative: string) => readFileSync(path.join(ROOT, relative), "utf8");

const COMPANY_ROUTES = [
  "src/app/api/companies/[companyId]/route.ts",
  "src/app/api/companies/[companyId]/members/route.ts",
  "src/app/api/companies/[companyId]/brain/route.ts",
  "src/app/api/companies/[companyId]/content/route.ts",
  "src/app/api/companies/[companyId]/content/[id]/route.ts",
  "src/app/api/companies/[companyId]/products/route.ts",
  "src/app/api/companies/[companyId]/products/[id]/route.ts",
  "src/app/api/companies/[companyId]/audiences/route.ts",
  "src/app/api/companies/[companyId]/audiences/[id]/route.ts",
  "src/app/api/companies/[companyId]/campaigns/route.ts",
  "src/app/api/companies/[companyId]/campaigns/[id]/route.ts",
  "src/app/api/companies/[companyId]/leads/route.ts",
  "src/app/api/companies/[companyId]/leads/[id]/route.ts",
  "src/app/api/companies/[companyId]/vacancies/route.ts",
  "src/app/api/companies/[companyId]/vacancies/[id]/route.ts",
  "src/app/api/companies/[companyId]/candidates/route.ts",
  "src/app/api/companies/[companyId]/candidates/[id]/route.ts",
  "src/app/api/companies/[companyId]/brands/route.ts",
  "src/app/api/companies/[companyId]/brands/[id]/route.ts",
  "src/app/api/companies/[companyId]/branches/route.ts",
  "src/app/api/companies/[companyId]/branches/[id]/route.ts",
  "src/app/api/companies/[companyId]/profiles/route.ts",
  "src/app/api/companies/[companyId]/profiles/[id]/route.ts",
];

describe("límite de autorización por empresa", () => {
  it("todas las rutas principales autorizan el companyId solicitado", () => {
    for (const route of COMPANY_ROUTES) {
      const source = read(route);
      expect(source, `${route} debe usar el helper centralizado`).toContain(
        "authorizeCompanyRequest(request, companyId)",
      );
      expect(
        source.includes("if (!authorization.ok) return authorization.response") ||
          source.includes('if ("response" in authorization) return authorization.response'),
        `${route} debe devolver la respuesta del helper`,
      ).toBe(true);
    }
  });

  it("el helper distingue sesión ausente, empresa inexistente y no membresía", () => {
    const source = read("src/modules/identity/http.ts");
    expect(source).toContain("eq(memberships.userId, session.user.id)");
    expect(source).toContain("eq(memberships.companyId, companyId)");
    expect(source).toContain('"UNAUTHENTICATED"');
    expect(source).toContain('"NOT_FOUND"');
    expect(source).toContain('"FORBIDDEN"');
  });

  it("las operaciones por id acotan la consulta por empresa", () => {
    const services = [
      "src/modules/products/service.ts",
      "src/modules/audiences/service.ts",
      "src/modules/campaigns/service.ts",
      "src/modules/leads/service.ts",
      "src/modules/talent/service.ts",
      "src/modules/brands/service.ts",
      "src/modules/branches/service.ts",
      "src/modules/profiles/service.ts",
    ];
    for (const service of services) {
      const source = read(service);
      expect(source, `${service} debe aceptar companyId en operaciones por id`).toMatch(
        /companyId\?: string/,
      );
      expect(source, `${service} debe combinar id y companyId`).toContain(
        "eq(",
      );
      expect(source, `${service} debe usar and() para el alcance`).toContain(
        "and(",
      );
    }
  });
});
