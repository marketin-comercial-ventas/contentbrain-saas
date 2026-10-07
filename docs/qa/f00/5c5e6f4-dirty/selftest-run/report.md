FEATURE COMPLETION GATE / MODULE GATE
Module: F00
Scope / Acceptance criteria: docs/modules/f00.md (criterios de aceptación del contrato)
Code commit: 5c5e6f4-dirty
Environment: platform=win32 node=v26.8.1 pnpm=11.23.0 embedded-postgres=17.10.0-beta.17
Evidence paths / CI run: docs\qa\f00\5c5e6f4-dirty/ (report.json, report.md, logs por comprobación) | CI: workflow local definido; sin remoto configurado

Requirements: NOT_EXECUTED
Implementation: NOT_EXECUTED
Lint: PASS
Typecheck: PASS
Unit Tests: FAIL
Integration Tests: PASS
E2E: PASS
Tenant Isolation: N/A
Permissions: N/A
Security: PASS
Responsive: N/A
Production Build: PASS
Regression: FAIL
Console / Server / Database review: NOT_EXECUTED
User workflow: NOT_EXECUTED

Applicability decisions: tenantIsolation=N/A; permissions=N/A; responsive=N/A
Skipped / not executed: ninguna (todas las comprobaciones ejecutadas)
Findings and corrections: unit: ver unit.log
QA reviewer: PENDIENTE (sin revisor independiente)
QA DECISION: PENDING
Supervisor decision: PENDING
Gate execution: COMPLETE
FINAL STATUS: REJECTED
Next module allowed: NO

Reasons: algún campo obligatorio es FAIL | unitTests: sin PASS registrado | regression: al menos una suite de esta ejecución falló | qa-verdict.json ausente: revisión independiente no ejecutada | supervisorDecision=PENDING
Check results: lint=PASS(2152ms) typecheck=PASS(1650ms) unit=FAIL(2372ms) build=PASS(4300ms) integration=PASS(1502ms) security=PASS(939ms) e2e=PASS(2944ms)
