import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/modules/identity/rate-limit";

describe("rate limiting en memoria", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("permite hasta el límite y rechaza el intento siguiente", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit("k", { limit: 3, windowMs: 60_000 }, now).allowed).toBe(true);
    }
    const blocked = rateLimit("k", { limit: 3, windowMs: 60_000 }, now);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("la ventana expirada vuelve a permitir", () => {
    const now = 1_000_000;
    expect(rateLimit("k", { limit: 1, windowMs: 1_000 }, now).allowed).toBe(true);
    expect(rateLimit("k", { limit: 1, windowMs: 1_000 }, now).allowed).toBe(false);
    expect(rateLimit("k", { limit: 1, windowMs: 1_000 }, now + 1_001).allowed).toBe(true);
  });

  it("las claves son independientes", () => {
    const now = 1_000_000;
    expect(rateLimit("a", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(true);
    expect(rateLimit("b", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(true);
    expect(rateLimit("a", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(false);
  });

  it("resetRateLimits limpia los contadores", () => {
    const now = 1_000_000;
    expect(rateLimit("k", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(true);
    expect(rateLimit("k", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(false);
    resetRateLimits();
    expect(rateLimit("k", { limit: 1, windowMs: 60_000 }, now).allowed).toBe(true);
  });
});
