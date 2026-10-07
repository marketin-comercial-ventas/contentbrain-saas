import { describe, expect, it } from "vitest";

describe("autotest del gate (falla inyectada)", () => {
  it("la suite normal pasa cuando no se pide autotest", () => {
    expect(process.env.GATE_SELFTEST).not.toBe("1");
  });
});
