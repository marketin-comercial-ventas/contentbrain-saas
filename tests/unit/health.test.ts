import { describe, expect, it } from "vitest";
import {
  HEALTH_RESPONSE_KEYS,
  healthResponseSchema,
  SERVICE_NAME,
} from "@/shared/contracts/health";
import { buildHealthPayload } from "@/shared/health/payload";

describe("contrato de salud del sistema", () => {
  it("genera un payload que valida el esquema compartido", () => {
    const payload = buildHealthPayload("0.1.0", new Date("2026-10-06T12:00:00.000Z"));
    const parsed = healthResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(payload).toEqual({
      status: "ok",
      service: SERVICE_NAME,
      version: "0.1.0",
      timestamp: "2026-10-06T12:00:00.000Z",
    });
  });

  it("no expone campos internos (uptime, pid, entorno, host)", () => {
    const payload = buildHealthPayload("0.1.0", new Date());
    expect(Object.keys(payload).sort()).toEqual([...HEALTH_RESPONSE_KEYS].sort());
  });

  it("rechaza timestamps que no sean ISO-8601", () => {
    const payload = buildHealthPayload("0.1.0", new Date());
    expect(healthResponseSchema.safeParse({ ...payload, timestamp: "ayer" }).success).toBe(false);
  });

  it("rechaza un estado distinto de ok", () => {
    const payload = buildHealthPayload("0.1.0", new Date());
    expect(healthResponseSchema.safeParse({ ...payload, status: "degraded" }).success).toBe(false);
  });
});
