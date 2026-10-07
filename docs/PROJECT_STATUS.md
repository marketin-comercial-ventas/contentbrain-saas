# PROJECT_STATUS

Vocabulario de estados de módulo (exclusivo):

`NOT_STARTED` · `IN_PROGRESS` · `IN_REVIEW` · `QA_FAILED` · `QA_APPROVED` · `DONE`

- `blocked` es un campo adicional (`blocked: true` + motivo + acción
  requerida), **no un séptimo estado**.
- Solo el Supervisor registra `DONE` tras gate `FINAL STATUS: APPROVED`.
- `QA_APPROVED` sin cierre del Supervisor no habilita el siguiente módulo.

## Estado global

| Campo | Valor |
|---|---|
| Bootstrap documental | COMPLETO (AGENTS.md, rules, agentes, skills, control, ADRs) |
| Módulo activo | F00 Foundation → DONE; F01 Identity → DONE; siguiente: F02 Multi-Tenant (NOT_STARTED) |
| Gate vigente | F01: `FINAL STATUS: APPROVED` (exit 0) — `docs/qa/f01/3ba7723-dirty/report.json` |
| Repositorio | Git `main` (ver `git log`); cierre de F01 |
| Bloqueos | CI/Vercel sin remoto ni credenciales (aceptado 2026-10-06, REQ-G-06/F00-06 en PEND) |

## Módulos

| ID | Módulo | Estado | Responsable | Evidencia | Bloqueo |
|---|---|---|---|---|---|
| F00 | Foundation | DONE | opencode · QA: qa-engineer (independiente) · Supervisor | `docs/qa/f00/5c5e6f4/` (gate en commit limpio) y `docs/qa/f00/5c5e6f4-dirty/` (QA APPROVED + gate final APPROVED + selftest REJECTED) | — |
| F01 | Identity | DONE | opencode · QA: qa-engineer (independiente) · Supervisor | `docs/qa/f01/3ba7723/` (gate commit limpio) y `docs/qa/f01/3ba7723-dirty/` (QA APPROVED + gate final APPROVED + selftest REJECTED) | — |
| F02 | Multi-Tenant | NOT_STARTED | — | — | — |
| F03 | Company Brain | NOT_STARTED | — | — | — |
| F04 | Catálogo | NOT_STARTED | — | — | — |
| F05 | Audiencias | NOT_STARTED | — | — | — |
| F06 | Rules Engine | NOT_STARTED | — | — | — |
| F07 | AI Core | NOT_STARTED | — | — | — |
| F08 | Media Library | NOT_STARTED | — | — | — |
| F09 | Hooks y Content Studio | NOT_STARTED | — | — | — |
| F10 | Campañas | NOT_STARTED | — | — | — |
| F11 | Approval Workflow | NOT_STARTED | — | — | — |
| F12 | Publishing Destinations | NOT_STARTED | — | — | — |
| F13 | Publishing Queue | NOT_STARTED | — | — | — |
| F14 | Calendar | NOT_STARTED | — | — | — |
| F15 | Meta Integration | NOT_STARTED | — | — | — |
| F16 | Sales | NOT_STARTED | — | — | — |
| F17 | Talent Vacancies | NOT_STARTED | — | — | — |
| F18 | Candidates/Applications | NOT_STARTED | — | — | — |
| F19 | Interviews/Assessments | NOT_STARTED | — | — | — |
| F20 | Hiring/Onboarding | NOT_STARTED | — | — | — |
| F21 | Analytics | NOT_STARTED | — | — | — |
| F22 | Plans/Usage | NOT_STARTED | — | — | — |
| F23 | Super Admin | NOT_STARTED | — | — | — |
| F24 | Production Hardening | NOT_STARTED | — | — | — |

Al iniciar un módulo: crear `docs/modules/<id>.md`, pasar el estado a
`IN_PROGRESS` y registrar responsable. Al entregar a QA: `IN_REVIEW`. Guardar
evidencia en `docs/qa/<id>/<commit>/`.

No marcar módulos como hechos por crear su estructura o documentación.

## Hallazgos QA de F00 (no bloqueantes; seguimiento en módulos siguientes)

F-01 `drizzle.config.ts` usa credencial localhost por defecto si falta
`DATABASE_URL` → exigirla explícitamente. · F-02 `--allow-pending-qa` sale 0
con `finalStatus=BLOCKED` (CI) → revisar contrato de exit codes. · F-03
versión de `embedded-postgres` hardcodeada en el environment del gate. ·
F-04 la inyección del selftest es por aserción de entorno (la detección real
de fallos la cubre `gate-decision.test.ts`). · F-05 en F00 la regresión es
re-ejecución sin comparación histórica (documentado en `TESTING.md`); desde
F01 comparar con el último módulo aprobado. · F-06 CI nunca ejecutada en
remoto (bloqueo aceptado).

Detalle completo: `docs/qa/f00/5c5e6f4-dirty/qa-verdict.json` y `review.md`.

## Decisiones de entorno (F00 + F01)

- **2026-10-07 — BD de pruebas:** PostgreSQL 17 instalado como **servicio**
  con winget (`postgresql-x64-17`) porque `embedded-postgres` no arranca en
  sesión de administrador; las suites crean/borran una base `app_test_*`
  dedicada por ejecución vía `TEST_DATABASE_URL` (`.env.local`), con
  `embedded-postgres` como respaldo automático (CI/sesión no elevada). Detalle
  en `docs/modules/f00.md` («Cambios acordados durante la ejecución»).
- **2026-10-07 — Orquestador de integración:** `scripts/run-integration.mjs`
  sustituye a `globalSetup` de vitest (importar `embedded-postgres` en el
  proceso de vitest reseteaba exit code a 0 y ocultaba fallos). El orquestador
  crea/borra bases y lanza `vitest` como subproceso, preservando exit codes.
