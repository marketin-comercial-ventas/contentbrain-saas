# ADR-0003: Aislamiento multi-tenant con RBAC explícito + RLS

- **Estado:** Aceptado
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor (decisión del propietario, MP secciones 5 y 6)

## Contexto

Multi-empresa en una base compartida: un fallo de aislamiento expone datos de
un cliente a otro. Ninguna capa aislada por sí sola es suficiente.

## Decisión

1. Filtro explícito por `tenant_id` en cada consulta/escritura del servicio,
   con autorización en servidor (membresía + permiso por acción + entitlement).
2. PostgreSQL RLS como defensa adicional en tablas de negocio: políticas por
   tenant, rol de aplicación sin privilegios que evadan políticas, contexto de
   tenant transaccional (no global por conexión reutilizable), credenciales de
   migraciones distintas.
3. FKs compuestas o equivalente para impedir referencias cruzadas.
4. Pruebas negativas de cruce obligatorias en cada módulo desde F02.

## Alternativas descartadas

- Solo filtros de aplicación: un único `where` olvidado filtra todo.
- Solo RLS: no sustituye RBAC, permisos por acción ni entitlements; también se
  probarían igual.
- Esquema por tenant: aislamiento fuerte pero operación y migraciones mucho
  más caras; fuera del alcance actual.

## Consecuencias

- Toda feature toca tres capas: servicio, política RLS y prueba negativa.
- Si la solución de conexión elegida impide aplicar políticas, bloquear el
  cierre del módulo de aislamiento; **nunca** deshabilitar RLS silenciosamente.
- Auditoría de aislamiento con skill `tenant-security-audit`.
