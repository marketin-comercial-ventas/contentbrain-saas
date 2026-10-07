# SaaS multiempresa · Growth · Sales · Talent

Plataforma genérica multiempresa (un tenant = una empresa) con capacidades de
**Growth**, **Sales** y **Talent**. Especificación completa:
[`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md). Mapa del repo:
[`AGENTS.md`](AGENTS.md).

## Estado

F00 Foundation en progreso. Ver [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).

## Stack

Next.js (App Router) · TypeScript estricto · React · Tailwind + shadcn/ui ·
PostgreSQL + Drizzle · pnpm · Vitest + Testing Library + Playwright · Vercel.
Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) y ADRs en
[`docs/decisions/`](docs/decisions/).

## Comandos

```text
pnpm install            # dependencias (lockfile versionado)
pnpm dev                # servidor de desarrollo
pnpm lint               # ESLint
pnpm typecheck          # tsc --noEmit
pnpm test:unit          # unitarias (Vitest, jsdom)
pnpm test:integration   # integración sobre PostgreSQL real: base dedicada por ejecución (servicio local o embedded-postgres)
pnpm test:security      # suite de seguridad (requiere pnpm build previo)
pnpm test:e2e           # Playwright (construye si falta el build)
pnpm test:regression    # unit + integration + security + e2e
pnpm build              # build de producción
pnpm quality:gate       # gate agregado (ver docs/TESTING.md)
pnpm db:generate        # genera migración desde el schema Drizzle
pnpm db:migrate         # aplica migraciones pendientes (DATABASE_URL)
```

## Entorno

Copia `.env.example` a `.env.local`. Las pruebas de integración levantan un
PostgreSQL real efímero (binarios en `node_modules`, sin instalar servicios).

## Gobierno

- Reglas: `.cursor/rules/` · Agentes: `.cursor/agents/` · Skills:
  `.cursor/skills/` (copia en `.opencode/skills/`)
- Requisitos: `docs/REQUIREMENTS.md` · Módulos: `docs/modules/` ·
  Evidencia QA: `docs/qa/<módulo>/<commit>/`
