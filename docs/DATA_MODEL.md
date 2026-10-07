# Modelo de datos

Documento vivo. El detalle por módulo se añade en `DATA_MODEL.md` al
implementarlo (F01+); los esquemas fuente son Drizzle en `src/server/db/` y
`src/modules/<dom>/`. Migraciones: ver `database-migration-review`.

## Principios

- Un tenant = una empresa. Todo registro de negocio lleva `tenant_id`
  explícito, salvo catálogos globales enumerados y documentados.
- FKs compuestas o restricciones equivalentes para impedir referencias entre
  entidades de tenants distintos; unicidad incluye el tenant cuando corresponda.
- Monedas con precisión explícita; instantes en UTC; zona horaria IANA por
  tenant; etiquetas traducibles con IDs internos estables.
- Borrado lógico donde aplique retención; nada de CASCADE que rompa auditoría.

## Entidades centrales (definidas desde F01/F02)

| Entidad | Contenido | Fase |
|---|---|---|
| `users` | identidad global de usuario | F01 |
| `tenants` | empresa/organización, zona horaria, configuración | F02 |
| `memberships` | usuario × tenant, estado, roles asignados | F02 |
| `roles`, `permissions`, `role_permissions` | autorización RBAC por acción | F02 |
| `invitations` | vencimiento, alcance, uso controlado | F02 |
| `branches`, `brands` | sucursales y marcas del tenant | F03 |
| `tenant_entitlements`, `usage_records` | módulos contratados, límites, consumo | F02/F22 |
| `audit_events` | actor, tenant, acción, recurso, resultado | F01+ |

## Dominios (se crean con su módulo)

- **company:** Company Brain versionado, perfiles Commercial/Talent (F03).
- **catalog:** productos, servicios, ofertas con vigencia (F04).
- **audiences:** avatares, segmentos, Candidate Persona (F05).
- **ai:** prompts versionados, registros de consumo, snapshots de contexto (F07).
- **media:** archivos, versiones, procedencia, ciclo de vida (F08).
- **growth/publishing:** contenido, aprobaciones, destinos, cola, calendario
  (F09-F14).
- **sales:** leads, oportunidades, etapas, tareas, atribución (F16).
- **talent:** vacantes, candidates, applications, entrevistas, scorecards,
  contratación, onboarding (F17-F20).
- **billing:** planes, cuotas, consumo (F22).

## Relación con RLS

Políticas por tenant en tablas de negocio (ADR-0003). Las políticas no
sustituyen RBAC ni filtros explícitos: ambas capas se prueban con el rol real
de ejecución.
