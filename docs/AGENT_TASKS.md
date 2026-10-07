# AGENT_TASKS

Registro de órdenes del Supervisor. Una tarea por línea; el formato es el
contrato mínimo exigible.

## Formato de orden

```text
TASK-<n> | módulo | objetivo | criterios de aceptación | archivos permitidos |
dependencias | pruebas esperadas | responsable | estado
```

Estados de tarea: `ASSIGNED` · `IN_PROGRESS` · `DELIVERED` · `REJECTED` ·
`BLOCKED` · `CLOSED`.

## Reglas

- Un responsable por archivo compartido (schema, migraciones, auth, lockfile,
  configuración, documentación de estado).
- Paralelizar solo tareas independientes dentro del módulo activo.
- Los agentes no cambian framework, ORM, DB, auth, tenancy, estructura global
  ni hosting: proponen ADR al Supervisor.
- El implementador no aprueba su propio trabajo como QA.

## Registro

| Task | Módulo | Objetivo | Responsable | Estado | Notas |
|---|---|---|---|---|---|
| — | — | Bootstrap documental (rules, agentes, skills, control, ADRs) | opencode (Supervisor) | CLOSED | Commit del bootstrap; sin tareas de agente delegadas aún |
