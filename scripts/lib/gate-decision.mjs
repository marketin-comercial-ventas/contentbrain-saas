export const AUTOMATED_FIELDS = [
  "lint",
  "typecheck",
  "unitTests",
  "integrationTests",
  "security",
  "e2e",
  "productionBuild",
];

export const APPLICABILITY_FIELDS = ["tenantIsolation", "permissions", "responsive"];

export const REVIEW_FIELDS = [
  "requirements",
  "implementation",
  "consoleServerDbReview",
  "userWorkflow",
];

export function isJustifiedNa(entry) {
  return (
    !!entry &&
    entry.status === "N/A" &&
    typeof entry.justification === "string" &&
    entry.justification.trim().length > 0 &&
    typeof entry.agreedBeforeExecution === "string" &&
    entry.agreedBeforeExecution.trim().length > 0
  );
}

export function decideFinalStatus({
  automated = {},
  applicability = {},
  regression = false,
  qaVerdict = null,
  supervisorDecision = "PENDING",
  codeCommit,
}) {
  const fields = {};
  const reasons = [];

  for (const field of AUTOMATED_FIELDS) {
    const value = automated[field];
    fields[field] = value === "PASS" ? "PASS" : "FAIL";
    if (fields[field] === "FAIL") reasons.push(`${field}: sin PASS registrado`);
  }

  for (const field of APPLICABILITY_FIELDS) {
    const entry = applicability[field];
    if (isJustifiedNa(entry)) {
      fields[field] = "N/A";
    } else if (entry && entry.status === "RUN" && entry.result) {
      fields[field] = entry.result === "PASS" ? "PASS" : "FAIL";
    } else {
      fields[field] = "BLOCKED";
      reasons.push(`${field}: sin decisión de aplicabilidad justificada registrada`);
    }
  }

  fields.regression = regression ? "PASS" : "FAIL";
  if (!regression) reasons.push("regression: al menos una suite de esta ejecución falló");

  let qaDecision = "PENDING";
  if (!qaVerdict) {
    for (const field of REVIEW_FIELDS) fields[field] = "NOT_EXECUTED";
    reasons.push("qa-verdict.json ausente: revisión independiente no ejecutada");
  } else if (qaVerdict.codeCommit !== codeCommit) {
    for (const field of REVIEW_FIELDS) fields[field] = "BLOCKED";
    reasons.push(
      `veredicto QA apunta al commit ${qaVerdict.codeCommit} ≠ ${codeCommit}: evidencia desactualizada`,
    );
  } else if (qaVerdict.independentOfImplementer !== true) {
    for (const field of REVIEW_FIELDS) fields[field] = "BLOCKED";
    reasons.push("el veredicto QA no declara revisor independiente del implementador");
  } else {
    for (const field of REVIEW_FIELDS) {
      const value = qaVerdict.fields ? qaVerdict.fields[field] : undefined;
      fields[field] = value === "PASS" ? "PASS" : value === "FAIL" ? "FAIL" : "NOT_EXECUTED";
    }
    qaDecision = qaVerdict.decision === "APPROVED" || qaVerdict.decision === "REJECTED"
      ? qaVerdict.decision
      : "PENDING";
    if (qaDecision !== "APPROVED") reasons.push(`qa-verdict.decision=${qaDecision}`);
  }

  if (supervisorDecision !== "APPROVED") {
    reasons.push(`supervisorDecision=${supervisorDecision}`);
  }

  const values = Object.values(fields);
  let finalStatus;
  if (values.includes("FAIL")) {
    finalStatus = "REJECTED";
    reasons.unshift("algún campo obligatorio es FAIL");
  } else if (
    values.some((value) => value === "BLOCKED" || value === "NOT_EXECUTED") ||
    qaDecision !== "APPROVED" ||
    supervisorDecision !== "APPROVED"
  ) {
    finalStatus = "BLOCKED";
  } else {
    finalStatus = "APPROVED";
  }

  return {
    fields,
    qaDecision,
    supervisorDecision,
    finalStatus,
    nextModuleAllowed: finalStatus === "APPROVED" ? "YES" : "NO",
    reasons,
  };
}

export function formatCanonicalReport(report) {
  const lines = [
    "FEATURE COMPLETION GATE / MODULE GATE",
    `Module: ${report.module}`,
    `Scope / Acceptance criteria: ${report.scope}`,
    `Code commit: ${report.codeCommit}`,
    `Environment: ${report.environment}`,
    `Evidence paths / CI run: ${report.evidencePaths}`,
    "",
    `Requirements: ${report.fields.requirements ?? "NOT EXECUTED"}`,
    `Implementation: ${report.fields.implementation ?? "NOT EXECUTED"}`,
    `Lint: ${report.fields.lint}`,
    `Typecheck: ${report.fields.typecheck}`,
    `Unit Tests: ${report.fields.unitTests}`,
    `Integration Tests: ${report.fields.integrationTests}`,
    `E2E: ${report.fields.e2e}`,
    `Tenant Isolation: ${report.fields.tenantIsolation}`,
    `Permissions: ${report.fields.permissions}`,
    `Security: ${report.fields.security}`,
    `Responsive: ${report.fields.responsive}`,
    `Production Build: ${report.fields.productionBuild}`,
    `Regression: ${report.fields.regression}`,
    `Console / Server / Database review: ${report.fields.consoleServerDbReview}`,
    `User workflow: ${report.fields.userWorkflow}`,
    "",
    `Applicability decisions: ${report.applicabilityDecisions}`,
    `Skipped / not executed: ${report.skipped}`,
    `Findings and corrections: ${report.findings}`,
    `QA reviewer: ${report.qaReviewer}`,
    `QA DECISION: ${report.qaDecision}`,
    `Supervisor decision: ${report.supervisorDecision}`,
    `Gate execution: ${report.gateExecution}`,
    `FINAL STATUS: ${report.finalStatus}`,
    `Next module allowed: ${report.nextModuleAllowed}`,
    "",
    `Reasons: ${report.reasons.length > 0 ? report.reasons.join(" | ") : "ninguna"}`,
    `Check results: ${report.checks
      .map((check) => `${check.id}=${check.status}(${check.durationMs}ms)`)
      .join(" ")}`,
  ];
  return `${lines.join("\n")}\n`;
}
