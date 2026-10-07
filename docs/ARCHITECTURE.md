# Arquitectura

Fuente de detalle: `docs/MASTER_PROMPT.md` secciones 3 y 31; decisiones en
`docs/decisions/`. Este resumen no contradice al prompt; lo precede en
legibilidad.

## Forma

Monolito modular: una aplicación Next.js (App Router), un repositorio Git,
dominios desacoplados. Sin microservicios ni apps separadas para Growth,
Sales o Talent.

## Stack fijo

| Componente | Decisión |
|---|---|
| App | Next.js App Router, TypeScript estricto |
| UI | React, Tailwind CSS, shadcn/ui |
| Datos | PostgreSQL (Neon preferido), ORM Drizzle |
| Validación | Esquemas compartidos, validación obligatoria en servidor |
| Hosting | Vercel; GitHub como remoto/CI preferido |
| Dependencias | pnpm con lockfile versionado |
| Tests | Vitest, Testing Library, PostgreSQL de pruebas real aislado, Playwright |
| Auth, archivos, jobs, IA | Adaptadores con ADR (0004-0007) |

Versiones concretas se verifican y fijan en F00 con evidencia; nada de `latest`
sin lockfile.

## Estructura

```text
src/app/            rutas y composición
src/modules/<dom>/  lógica de dominio (identity, tenancy, company, catalog,
                    audiences, rules, ai, growth, publishing, sales, talent,
                    analytics, billing, platform-admin)
src/shared/         contratos, esquemas compartidos, utilidades
src/server/db|auth|storage|jobs|integrations/
tests/unit|integration|e2e|security|fixtures/
docs/               gobierno, módulos, qa, releases, decisions
```

Carpetas de dominio solo se crean cuando hay contenido real.

## Límites entre dominios

- Comunicación por contratos públicos; prohibido importar internos de otro
  dominio.
- Si se persiste y se emite un evento en la misma transacción, usar patrón
  verificable (outbox).
- Eventos, consumidores, idempotencia y propietario de datos documentados en
  el contrato del módulo.

## Tenancy

Un tenant = una empresa. Todo registro de negocio lleva `tenant_id`; RLS como
defensa adicional (ADR-0003); RBAC por acción + entitlements + permiso,
validados en servidor. Detalle: reglas `multi-tenancy.mdc` y
`docs/DATA_MODEL.md`.

## Entornos

Desarrollo, pruebas, preview/staging y producción separados. Nunca pruebas
destructivas sobre datos reales.
