---
name: database-migration-review
description: Revisar esquemas y migraciones PostgreSQL/Drizzle con datos existentes y aislamiento multi-tenant. Usar antes de integrar cambios de tablas, indices, constraints, RLS o transformaciones de datos.
---

# Revisión de migraciones

Leer DATA_MODEL.md, ADRs, migraciones existentes y contrato del cambio.

1. Confirmar que la migración sea versionada y coherente con el schema.
2. Revisar tenant_id, claves, unicidad, FKs compuestas, índices y políticas RLS.
3. Examinar defaults, nullabilidad, precisión monetaria, timestamps y borrados.
4. Detectar pérdida de datos, bloqueos largos, reescrituras y cambios incompatibles.
5. Definir estrategia expand/migrate/contract cuando haya despliegue gradual.
6. Definir backup, recuperación o roll-forward; no prometer rollback destructivo seguro.
7. Aplicar migraciones en una base vacía y en una base con datos ficticios previos.
8. Probar integridad, autorización y compatibilidad de versiones según el despliegue.
9. Verificar backfills acotados, reiniciables e idempotentes cuando corresponda.
10. Registrar comandos, tiempos, resultados y riesgos operativos.

No modificar una migración ya aplicada en entornos compartidos: crear otra.
No sustituir migraciones revisables por sincronización destructiva automática.
No usar credenciales de producción en pruebas ni el rol migrador en la aplicación.
No considerar repetición de una migración arbitraria como un requisito de idempotencia:
el runner debe registrar su aplicación; los backfills/reintentos sí necesitan diseño explícito.

Emitir PASS, FAIL o BLOCKED con evidencia y condiciones de despliegue.
Remitir a QA. Una revisión aprobada no autoriza por sí sola ejecutar sobre producción.
