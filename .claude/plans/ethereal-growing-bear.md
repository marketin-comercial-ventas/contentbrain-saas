# Plan de Implementación: Módulo F02 — Multi-Tenant

## Contexto
Tras completar y certificar formalmente los módulos **F00 (Foundation)** y **F01 (Identity)** con sus respectivos reportes de QA y gates aprobados, el proyecto debe avanzar al módulo **F02 (Multi-Tenant)** según el ROADMAP y la especificación del `docs/MASTER_PROMPT.md` (secciones 4, 5, 6, 35 y 37).

El módulo F02 introduce el modelo de aislamiento de datos multiempresa, gestión de empresas (`companies`), membresías de usuarios (`memberships`), invitaciones con expiración (`invitations`), control de acceso basado en roles y permisos (RBAC por acción) e integración de auditoría con soporte para `company_id`.

## Objetivos del Módulo F02
1. **Documentación de Gobierno y Contrato:**
   - Crear `docs/modules/f02.md` con alcance, contratos API, migraciones, criterios de aceptación (CA-01 a CA-08) y matriz de pruebas.
   - Definir `docs/modules/f02.applicability.json` para el gate de calidad.
   - Actualizar `docs/PROJECT_STATUS.md` cambiando el estado de F02 a `IN_PROGRESS`.
   - Registrar requisitos REQ-F02-01..08 y actualizar REQ-G-02/REQ-G-03 en `docs/REQUIREMENTS.md`.

2. **Modelo de Datos y Migraciones (`src/server/db/schema.ts`):**
   - Consolidar la tabla `companies` (slug único, colores de marca, campos de timestamps).
   - Consolidar la tabla `memberships` (`user_id`, `company_id`, `role`, índice único compuesto).
   - Crear la tabla `invitations` (`id`, `company_id`, `email`, `role`, `token_hash`, `expires_at`, `used_at`, `created_by`).
   - Actualizar `audit_events` para soportar `company_id` (opcional o de alcance tenant).
   - Generar y verificar la migración Drizzle (`drizzle/0002_multi_tenant.sql`).

3. **Capa de Dominio y Contratos Compartidos:**
   - Crear contratos Zod en `src/shared/contracts/tenants.ts` para creación/edición de empresas, invitación de miembros, cambio de rol y aceptación de invitaciones.
   - Refactorizar y tipar de forma estricta `src/modules/companies/service.ts` (eliminando `// @ts-nocheck`).
   - Implementar helper de resolución de contexto de tenant en servidor (`src/server/tenant-context.ts` o `src/modules/companies/http.ts`) que verifique sesión activa + membresía válida en la empresa.

4. **API y Seguridad Multi-Tenant:**
   - `POST /api/companies` — Crear nueva empresa (asigna automáticamente el rol `owner` al usuario creador).
   - `GET /api/companies` — Listar empresas a las que pertenece el usuario autenticado.
   - `GET /api/companies/[companyId]` — Obtener detalle de empresa (requiere membresía activa).
   - `PATCH /api/companies/[companyId]` — Actualizar empresa (requiere permiso `admin` u `owner`).
   - `GET /api/companies/[companyId]/members` — Listar miembros de la empresa.
   - `POST /api/companies/[companyId]/invitations` — Crear invitación a la empresa.
   - `POST /api/invitations/accept` — Aceptar invitación mediante token.
   - Aplicar rate limiting y validación estricta en servidor.

5. **Pruebas y Verificación:**
   - **Pruebas Unitarias (`tests/unit/`):** Validadores Zod, derivación de slug y lógica de tokens de invitación.
   - **Pruebas de Integración (`tests/integration/`):** Ciclo completo de creación de empresa, obtención de membresía, invitación de nuevo usuario, aceptación de invitación y cambio de rol.
   - **Pruebas de Seguridad (`tests/security/`):** Pruebas negativas de aislamiento (un usuario autenticado en Tenant A intenta acceder/modificar recursos de Tenant B y recibe 403 Forbidden o 404 Not Found; manipulación de `tenant_id` en payload).
   - **Pruebas E2E (`tests/e2e/`):** Flujo de UI de gestión de empresas e invitaciones.

## Archivos Críticos
- **Documentación:** `docs/modules/f02.md`, `docs/modules/f02.applicability.json`, `docs/PROJECT_STATUS.md`, `docs/REQUIREMENTS.md`.
- **Esquemas:** `src/server/db/schema.ts`, `drizzle/0002_multi_tenant.sql` (a generar).
- **Contratos:** `src/shared/contracts/tenants.ts`.
- **Lógica de Servicio:** `src/modules/companies/service.ts`, `src/modules/memberships/service.ts`, `src/modules/invitations/service.ts`.
- **Controladores de API:** `src/app/api/companies/route.ts`, `src/app/api/companies/[companyId]/route.ts`, `src/app/api/companies/[companyId]/members/route.ts`, `src/app/api/companies/[companyId]/invitations/route.ts`, `src/app/api/invitations/accept/route.ts`.
- **Pruebas:** `tests/unit/tenants.test.ts`, `tests/integration/tenants.test.ts`, `tests/security/tenant-isolation.test.ts`.

## Reutilización de Código Existente
- **Autenticación y Sesiones (`src/modules/identity/http.ts`, `src/modules/identity/service.ts`):** `getCurrentUser` y `requireUser` para resolver la sesión del usuario.
- **Cliente DB y Utilitarios (`src/server/db/client.ts`):** Instancia Drizzle y conexión a PostgreSQL de prueba.
- **Rate Limit (`src/modules/identity/rate-limit.ts`):** Para protección contra abusos en endpoint de invitaciones.

## Estrategia de Verificación Final
1. Ejecutar `pnpm typecheck` asegurando 0 errores de compilación TypeScript.
2. Ejecutar `pnpm test:unit` para verificar esquemas y utilitarios.
3. Ejecutar `pnpm test:integration` con la base de datos PostgreSQL de pruebas aislada (`scripts/run-integration.mjs`).
4. Ejecutar `pnpm test:security` con las pruebas de barrera multi-tenant.
5. Ejecutar `pnpm quality:gate` y verificar que el reporte en `docs/qa/f02/` apruebe la transición.
