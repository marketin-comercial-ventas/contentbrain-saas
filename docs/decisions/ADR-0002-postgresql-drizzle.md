# ADR-0002: PostgreSQL + Drizzle

- **Estado:** Aceptado
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor (decisión del propietario, MP sección 3)

## Contexto

Datos relacionales con aislamiento multi-tenant estricto, RLS, constraints y
migraciones revisables; servicio administrado preferido (Neon).

## Decisión

PostgreSQL como SGBD (Neon preferido) y Drizzle como ORM, con validación en
servidor mediante esquemas compartidos. Migraciones versionadas y revisadas
con `database-migration-review`.

## Alternativas descartadas

- MongoDB: pierde RLS, FKs compuestas y integridad referencial por tenant.
- Prisma: posible, pero se mantiene la decisión fija del prompt; cambiarla
  requiere nuevo ADR.
- ORM sin migraciones revisables / sync automático destructivo: prohibido.

## Consecuencias

- RLS y constraints como defensa en profundidad (ver ADR-0003).
- Pruebas de integración deben correr contra PostgreSQL real aislado.
- El pool/conexión debe permitir contexto de tenant transaccional; si no lo
  permite, se detiene el cierre del módulo de aislamiento y se resuelve por
  ADR.
