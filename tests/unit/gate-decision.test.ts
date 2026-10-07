import { describe, expect, it } from "vitest";
import {
  decideFinalStatus,
  formatCanonicalReport,
  isJustifiedNa,
} from "../../scripts/lib/gate-decision.mjs";

const COMMIT = "abc1234";

function baseAutomated(status = "PASS") {
  return {
    lint: status,
    typecheck: status,
    unitTests: status,
    integrationTests: status,
    security: status,
    e2e: status,
    productionBuild: status,
  };
}

const justifiedApplicability = {
  tenantIsolation: {
    status: "N/A",
    justification: "F00 excluye F01/F02",
    agreedBeforeExecution: "2026-10-06",
  },
  permissions: { status: "N/A", justification: "sin roles", agreedBeforeExecution: "2026-10-06" },
  responsive: { status: "N/A", justification: "sin UI", agreedBeforeExecution: "2026-10-06" },
};

const approvedVerdict = {
  codeCommit: COMMIT,
  reviewer: "qa-independiente",
  independentOfImplementer: true,
  decision: "APPROVED",
  fields: {
    requirements: "PASS",
    implementation: "PASS",
    consoleServerDbReview: "PASS",
    userWorkflow: "PASS",
  },
};

describe("isJustifiedNa", () => {
  it("exige justificación y fecha de aceptación previa", () => {
    expect(isJustifiedNa(justifiedApplicability.tenantIsolation)).toBe(true);
    expect(isJustifiedNa({ status: "N/A" })).toBe(false);
    expect(isJustifiedNa({ status: "N/A", justification: "x", agreedBeforeExecution: "" })).toBe(
      false,
    );
    expect(isJustifiedNa(null)).toBe(false);
  });
});

describe("decideFinalStatus", () => {
  it("aprueba solo con todo PASS, QA y Supervisor aprobados", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: justifiedApplicability,
      regression: true,
      qaVerdict: approvedVerdict,
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("APPROVED");
    expect(result.nextModuleAllowed).toBe("YES");
  });

  it("rechaza con un FAIL obligatorio aunque exista QA", () => {
    const result = decideFinalStatus({
      automated: { ...baseAutomated(), unitTests: "FAIL" },
      applicability: justifiedApplicability,
      regression: false,
      qaVerdict: approvedVerdict,
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("REJECTED");
    expect(result.nextModuleAllowed).toBe("NO");
    expect(result.reasons.join(" ")).toMatch(/unitTests/);
  });

  it("bloquea cuando falta el veredicto QA (evidencia ausente)", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: justifiedApplicability,
      regression: true,
      qaVerdict: null,
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("BLOCKED");
    expect(result.nextModuleAllowed).toBe("NO");
    expect(result.qaDecision).toBe("PENDING");
    expect(result.fields.requirements).toBe("NOT_EXECUTED");
  });

  it("bloquea cuando el veredicto QA apunta a otro commit", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: justifiedApplicability,
      regression: true,
      qaVerdict: { ...approvedVerdict, codeCommit: "otro000" },
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("BLOCKED");
    expect(result.reasons.join(" ")).toMatch(/evidencia desactualizada/);
  });

  it("bloquea sin decisión de Supervisor", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: justifiedApplicability,
      regression: true,
      qaVerdict: approvedVerdict,
      supervisorDecision: "PENDING",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("BLOCKED");
    expect(result.nextModuleAllowed).toBe("NO");
  });

  it("bloquea si la aplicabilidad no está justificada previamente", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: {},
      regression: true,
      qaVerdict: approvedVerdict,
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.finalStatus).toBe("BLOCKED");
    expect(result.fields.tenantIsolation).toBe("BLOCKED");
  });

  it("no acepta N/A con justificación posterior o ausente", () => {
    const result = decideFinalStatus({
      automated: baseAutomated(),
      applicability: {
        tenantIsolation: { status: "N/A", justification: "x" },
        permissions: justifiedApplicability.permissions,
        responsive: justifiedApplicability.responsive,
      },
      regression: true,
      qaVerdict: approvedVerdict,
      supervisorDecision: "APPROVED",
      codeCommit: COMMIT,
    });
    expect(result.fields.tenantIsolation).toBe("BLOCKED");
    expect(result.finalStatus).toBe("BLOCKED");
  });
});

describe("formatCanonicalReport", () => {
  it("produce el formato canónico con todos los campos", () => {
    const decision = decideFinalStatus({
      automated: baseAutomated(),
      applicability: justifiedApplicability,
      regression: true,
      qaVerdict: null,
      supervisorDecision: "PENDING",
      codeCommit: COMMIT,
    });
    const text = formatCanonicalReport({
      module: "F00",
      scope: "docs/modules/f00.md",
      codeCommit: COMMIT,
      environment: "test",
      evidencePaths: "docs/qa/f00/test",
      fields: decision.fields,
      applicabilityDecisions: "test",
      skipped: "ninguna",
      findings: "ninguno",
      qaReviewer: "PENDIENTE",
      qaDecision: decision.qaDecision,
      supervisorDecision: decision.supervisorDecision,
      gateExecution: "COMPLETE",
      finalStatus: decision.finalStatus,
      nextModuleAllowed: decision.nextModuleAllowed,
      reasons: decision.reasons,
      checks: [{ id: "lint", status: "PASS", durationMs: 1 }],
    });
    expect(text).toContain("FEATURE COMPLETION GATE / MODULE GATE");
    expect(text).toContain("FINAL STATUS: BLOCKED");
    expect(text).toContain("Tenant Isolation: N/A");
    expect(text).toContain("Next module allowed: NO");
    for (const line of [
      "Requirements:",
      "Lint:",
      "Regression:",
      "QA DECISION:",
      "Supervisor decision:",
      "Gate execution:",
    ]) {
      expect(text).toContain(line);
    }
  });
});
