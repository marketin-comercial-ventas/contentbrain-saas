FEATURE COMPLETION GATE / MODULE GATE
Module: F02
Scope / Acceptance criteria: docs/modules/f02.md (criterios de aceptación del contrato)
Code commit: 0ccdadd-dirty
Environment: platform=win32 node=v22.23.2 pnpm=11.23.0 embedded-postgres=17.10.0-beta.17
Evidence paths / CI run: docs\qa\f02\0ccdadd-dirty/ (report.json, report.md, logs por comprobación) | CI: workflow local definido; sin remoto configurado

Requirements: NOT_EXECUTED
Implementation: NOT_EXECUTED
Lint: FAIL
Typecheck: PASS
Unit Tests: PASS
Integration Tests: PASS
E2E: FAIL
Tenant Isolation: BLOCKED
Permissions: BLOCKED
Security: PASS
Responsive: BLOCKED
Production Build: PASS
Regression: FAIL
Console / Server / Database review: NOT_EXECUTED
User workflow: NOT_EXECUTED

Applicability decisions: tenantIsolation=APPLIES; permissions=APPLIES; responsive=APPLIES
Skipped / not executed: ninguna (todas las comprobaciones ejecutadas)
Findings and corrections: lint: ver lint.log; e2e: ver e2e.log
QA reviewer: PENDIENTE (sin revisor independiente)
QA DECISION: PENDING
Supervisor decision: PENDING
Gate execution: COMPLETE
FINAL STATUS: REJECTED
Next module allowed: NO

Reasons: algún campo obligatorio es FAIL | lint: sin PASS registrado | e2e: sin PASS registrado | tenantIsolation: sin decisión de aplicabilidad justificada registrada | permissions: sin decisión de aplicabilidad justificada registrada | responsive: sin decisión de aplicabilidad justificada registrada | regression: al menos una suite de esta ejecución falló | qa-verdict.json ausente: revisión independiente no ejecutada | supervisorDecision=PENDING
Check results: lint=FAIL(10926ms) typecheck=PASS(3965ms) unit=PASS(6327ms) build=PASS(8403ms) integration=PASS(14267ms) security=PASS(1541ms) e2e=FAIL(10137ms)
