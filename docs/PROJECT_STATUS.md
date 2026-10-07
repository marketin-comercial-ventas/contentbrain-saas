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
| Módulo activo | F00 Foundation (no iniciado) |
| Gate vigente | Ninguno ejecutado; comandos de gate aún no implementados |
| Repositorio | Git `main`, último commit `e3bf5a3` |
| Bloqueos | Ninguno declarado |

## Módulos

| ID | Módulo | Estado | Responsable | Evidencia | Bloqueo |
|---|---|---|---|---|---|
| F00 | Foundation | NOT_STARTED | — | — | — |
| F01 | Identity | NOT_STARTED | — | — | — |
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
