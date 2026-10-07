# ROADMAP

Orden de construcción (MASTER_PROMPT sección 37). Cada fase exige gate.
Estados: `NOT_STARTED` · `IN_PROGRESS` · `IN_REVIEW` · `QA_FAILED` ·
`QA_APPROVED` · `DONE` (detalle y bloqueos en `PROJECT_STATUS.md`).

Pre-condición completada: bootstrap documental (Rules, agentes, Skills,
documentos de control, ADRs iniciales). No autoriza a aprobar Foundation.

| Fase | Módulo | Estado |
|---|---|---|
| F00 | Foundation: repo, stack, versiones, entorno, DB de pruebas, migraciones iniciales, CI, gate ejecutable, destino de despliegue verificado | DONE |
| F01 | Identity: cuentas, login, sesiones, recuperación, autorización base | NOT_STARTED |
| F02 | Multi-Tenant: organizaciones, membresías, invitaciones, RBAC, RLS, cambio de empresa, entitlements | NOT_STARTED |
| F03 | Company Brain, marcas, sucursales, perfiles Commercial/Talent | NOT_STARTED |
| F04 | Catálogo de productos, servicios, precios y ofertas | NOT_STARTED |
| F05 | Audiencias: avatares comerciales, segmentos, Candidate Persona | NOT_STARTED |
| F06 | Rules Engine y construcción de contexto | NOT_STARTED |
| F07 | AI Core: proveedores, consumo, evaluación, generación para Brain/audiencias | NOT_STARTED |
| F08 | Media Library: archivos privados, ciclo de vida, permisos | NOT_STARTED |
| F09 | Hooks y Content Studio | NOT_STARTED |
| F10 | Campañas y vinculación de audiencias | NOT_STARTED |
| F11 | Approval Workflow y versionado aprobable | NOT_STARTED |
| F12 | Publishing Destinations | NOT_STARTED |
| F13 | Publishing Queue (adaptador; sin integración externa real) | NOT_STARTED |
| F14 | Calendar y reprogramación | NOT_STARTED |
| F15 | Meta Integration: conector real y publicación completa | NOT_STARTED |
| F16 | Sales: formularios, leads, oportunidades, seguimiento, atribución | NOT_STARTED |
| F17 | Talent Vacancies: vacantes, formularios, campañas | NOT_STARTED |
| F18 | Candidates/Applications: CV, parsing, pipeline ATS | NOT_STARTED |
| F19 | Interviews/Assessments: entrevistas, preguntas, scorecards | NOT_STARTED |
| F20 | Hiring/Onboarding: ofertas, checklists, tareas, documentos | NOT_STARTED |
| F21 | Analytics: Growth, Sales, Talent, refinamiento | NOT_STARTED |
| F22 | Plans/Usage: cuotas y ciclo de planes | NOT_STARTED |
| F23 | Super Admin: operaciones de plataforma restringidas | NOT_STARTED |
| F24 | Production Hardening: restauración, seguridad, carga, regresión, release | NOT_STARTED |

Reglas:

- Un solo módulo activo. Si una fase es grande, dividirla en submódulos con
  criterios y gates propios antes de desarrollarla.
- Tras `FINAL STATUS: APPROVED`, el Supervisor inicia la siguiente sin
  confirmación rutinaria, dentro del encargo autorizado.
- No redefinir alcance para sacar del gate algo que falló.
