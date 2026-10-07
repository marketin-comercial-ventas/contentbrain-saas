# AGENTS.md

Mapa breve del repositorio para cualquier agente. No sustituye `docs/MASTER_PROMPT.md`;
solo orienta y enlaza. Última actualización: bootstrap documental (F00 pendiente).

## Qué es esta plataforma

SaaS multiempresa genérico (un tenant = una empresa) con tres capacidades:
**Growth** (Company Brain, audiencias, contenido IA, campañas, publicación),
**Sales** (leads, oportunidades, seguimiento) y **Talent** (vacantes, ATS,
entrevistas, contratación, onboarding). No codificar empresas, marcas ni
procesos particulares; todo configurable desde la interfaz.

## Arquitectura (fija)

Monolito modular: una app Next.js (App Router), TypeScript estricto, React +
Tailwind + shadcn/ui, PostgreSQL (Neon preferido), Drizzle, validación en
servidor con esquemas compartidos, Vercel, pnpm con lockfile, Vitest +
Testing Library + Playwright, tests de integración contra PostgreSQL real
aislado. Un único repositorio Git.

Detalle y alternativas: `docs/ARCHITECTURE.md` y ADRs en `docs/decisions/`.

## Rutas clave

| Ruta | Contenido |
|---|---|
| `docs/MASTER_PROMPT.md` | Especificación completa (fuente de verdad) |
| `docs/PROJECT_STATUS.md` | Estado de módulos, bloqueos, gate vigente |
| `docs/REQUIREMENTS.md` | Matriz de requisitos con trazabilidad |
| `docs/modules/<module-id>.md` | Contrato de cada módulo |
| `docs/qa/<module-id>/<commit>/` | Evidencia de QA y gates |
| `docs/decisions/` | ADRs |
| `.cursor/rules/` | Reglas permanentes (.mdc) |
| `.cursor/agents/` | Perfiles de agentes para delegación |
| `.cursor/skills/` | Skills (`.opencode/skills/` es copia para OpenCode) |
| `src/app/` | Rutas y composición; la lógica vive en `src/modules/<dom>/` |
| `src/server/` | db, auth, storage, jobs, integrations |
| `src/shared/` | Contratos, utilidades y esquemas compartidos |
| `tests/` | unit, integration, e2e, security, fixtures |

## Roles

Supervisor (coordinación y cierre) y perfiles especializados en
`.cursor/agents/`: architect, database-engineer, domain-engineer,
frontend-engineer, ai-engineer, integrations-engineer, talent-engineer,
security-reviewer, qa-engineer. El implementador nunca aprueba su propio
trabajo como QA.

## Comandos (contrato deseado — implementar en F00)

```text
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:security
pnpm test:regression
pnpm build
pnpm quality:gate
```

**Estado actual:** `package.json` no existe todavía; estos comandos aún no
funcionan. No ejecutarlos ni afirmar que pasan hasta que F00 los implemente.

## Definición de terminado (resumen)

Un módulo termina cuando cumple requisitos y criterios de su contrato,
persiste datos, controla acceso, maneja errores, tiene migraciones y
documentación, pasa lint/tipos/unitarias/integración/E2E/build/regresión,
obtiene QA independiente APPROVED y cierre del Supervisor sobre el commit
validado (`feature-completion-gate`). Nada de lo anterior por afirmación:
solo con evidencia reproducible.

## Orden de lectura antes de editar

1. `AGENTS.md` (este archivo)
2. `docs/MASTER_PROMPT.md`
3. ADRs vigentes en `docs/decisions/`
4. `docs/PROJECT_STATUS.md` + `docs/modules/<módulo activo>.md`
5. Reglas `.cursor/rules/` y Skills aplicables
6. Estado Git real (`git status`, `git log`)

## Skills

`module-development` · `module-qa` · `tenant-security-audit` ·
`database-migration-review` · `integration-review` · `release-check` ·
`feature-completion-gate` (obligatoria antes de DONE o del siguiente módulo).
