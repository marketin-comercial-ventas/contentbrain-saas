# Índice de ADRs

Formato: contexto, decisión, alternativas, consecuencias, estado, fecha,
responsable. Estado: `Propuesto` · `Aceptado` · `Rechazado` · `Superseded`.

| ADR | Título | Estado |
|---|---|---|
| [ADR-0001](ADR-0001-monolito-nextjs.md) | Monolito modular Next.js | Aceptado |
| [ADR-0002](ADR-0002-postgresql-drizzle.md) | PostgreSQL + Drizzle | Aceptado |
| [ADR-0003](ADR-0003-aislamiento-multi-tenant.md) | Aislamiento multi-tenant: RBAC + RLS | Aceptado |
| [ADR-0004](ADR-0004-autenticacion.md) | Autenticación con biblioteca mantenida | Propuesto (F01) |
| [ADR-0005](ADR-0005-ai-core.md) | AI Core con adaptadores por proveedor | Propuesto (F07) |
| [ADR-0006](ADR-0006-almacenamiento.md) | Almacenamiento privado mediante adaptador | Propuesto (F08) |
| [ADR-0007](ADR-0007-trabajos-durables.md) | Cola/workflow durable + Vercel Cron | Propuesto (F00/F13) |
| [ADR-0008](ADR-0008-rbac-entitlements.md) | RBAC por acción + entitlements + flags | Aceptado |
| [ADR-0009](ADR-0009-contratos-dominios.md) | Contratos públicos entre dominios | Aceptado |

Regla: ningún agente cambia framework, ORM, base de datos, autenticación,
estrategia de tenant, estructura global ni hosting sin un ADR nuevo aprobado
por el Supervisor (y por el propietario si altera una decisión material).
