# ADR-0008: RBAC por acción + entitlements + feature flags

- **Estado:** Aceptado
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor (decisión del propietario, MP sección 6)

## Contexto

Roles configurables por tenant, permisos granulares y módulos contratados que
no deben confundirse entre sí.

## Decisión

Tres capas independientes, todas validadas en servidor:

1. **Permiso (RBAC):** acciones por usuario (`read`, `create`, `edit`,
   `archive`, `publish`, `approve`, `export`, `manage_integrations`,
   `access_private_documents`) vía `roles`/`permissions`/`role_permissions`.
   Roles iniciales configurables: propietario, administrador, marketing,
   ventas, reclutador, entrevistador, aprobador, lector. El administrador de
   plataforma (Super Admin, F23) está separado de los roles del tenant.
2. **Entitlement:** módulos incluidos en el contrato del tenant
   (`MARKETING`, `CONTENT_STUDIO`, `SOCIAL_PUBLISHING`, `CAMPAIGNS`, `LEADS`,
   `RECRUITING`, `CANDIDATES`, `INTERVIEWS`, `ASSESSMENTS`, `HIRING`,
   `ONBOARDING`) con límites y consumo.
3. **Feature flag:** habilitación técnica o despliegue gradual.

Tener uno no concede los otros. Desactivar módulo no elimina datos: definir
lectura, retención y bloqueo de nuevos trabajos.

## Alternativas descartadas

- Roles monolíticos ("admin hace todo"): demasiado permiso por defecto.
- Entitlement solo en UI: el servidor debe validarlo.

## Consecuencias

- Matriz de permisos obligatoria en `DATA_MODEL.md`/contrato por módulo.
- Implica pruebas negativas de permiso insuficiente y módulo desactivado en
  cada feature.
