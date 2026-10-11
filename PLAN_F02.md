# Plan de Implementación: F02 Multi-Tenant

Este plan detalla los pasos para implementar el módulo F02 Multi-Tenant según el contrato en `docs/modules/f02.md`.

## 1. Esquema de Base de Datos

### 1.1. Tablas
- **companies**
  - id (PK, UUID)
  - name (String)
  - slug (String, único)
  - logoUrl (String, opcional)
  - primaryColor (String)
  - secondaryColor (String)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)

- **memberships**
  - id (PK, UUID)
  - userId (FK → usuarios.id)
  - companyId (FK → companies.id)
  - role (Enum: owner, admin, member, viewer)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)
  - Restricción única: (userId, companyId)

- **invitations**
  - id (PK, UUID)
  - companyId (FK → companies.id)
  - email (String)
  - role (Enum: owner, admin, member, viewer)
  - tokenHash (String, hash del token)
  - expiresAt (Timestamp)
  - usedAt (Timestamp, nullable)
  - inviterId (FK → usuarios.id, nullable)
  - createdAt (Timestamp)

- **audit_events** (extensión)
  - Añadir columna `company_id` (FK → companies.id) para eventos de ámbito tenant.

### 1.2. Migraciones
- Usar Drizzle para crear las tablas.
- Scripts en `drizzle/` o mediante `drizzle-kit`.

## 2. Contratos Zod

### 2.1. Archivo: `src/shared/contracts/tenants.ts`
- Esquemas para:
  - Creación de empresa (name, slug, logoUrl?, primaryColor, secondaryColor)
  - Actualización de empresa (campos opcionales)
  - Creación de membresía (userId, companyId, role)
  - Creación de invitación (email, role, companyId)
  - Aceptación de invitación (token)

## 3. Servicios de Negocio

### 3.1. Módulo: `src/modules/companies/`
- **service.ts**
  - `createCompany(data, userId)`: crea empresa y asigna rol `owner` al usuario.
  - `getCompanyById(id, userId?)`: busca empresa por ID, opcionalmente validando pertenencia.
  - `getCompanyBySlug(slug, userId?)`: busca por slug, opcionalmente validando pertenencia.
  - `updateCompany(id, data, userId)`: actualiza empresa (requiere rol owner/admin).
  - `getCompaniesByUser(userId)`: lista empresas donde el usuario es miembro.
  - `deleteCompany(id, userId)`: elimina empresa (requiere rol owner).

### 3.2. Módulo: `src/modules/invitations/`
- **service.ts**
  - `createInvitation(companyId, data, inviterId)`: crea invitación con token hash y expiración (48h).
  - `getInvitationByToken(token)`: busca invitación por token (sin hash).
  - `acceptInvitation(token, userId)`: valida token, crea membresía, marca invitación como usada.
  - `getInvitationsByCompany(companyId)`: lista invitaciones de una empresa.
  - `revokeInvitation(id, companyId)`: revoca invitación (requiere rol owner/admin).

## 4. Contexto de Servidor y Autorización

### 4.1. Helper: `src/modules/tenants/http.ts` (o similar)
- `requireTenantMember(companyId, request)`:
  1. Valida sesión (auth).
  2. Verifica que el usuario pertenece a la empresa (membership).
  3. Lanza error 401 si no hay sesión, 403 si no es miembro, 404 si la empresa no existe.
- `getTenantMemberRole(companyId, request)`: devuelve el rol del usuario en la empresa.

## 5. Endpoints de API

### 5.1. `src/app/api/companies/route.ts`
- `GET`: listar empresas del usuario (usa `getCompaniesByUser`).
- `POST`: crear empresa (usa `createCompany`).

### 5.2. `src/app/api/companies/[companyId]/route.ts`
- `GET`: obtener detalle (usa `getCompanyById` con validación de membresía).
- `PATCH`: actualizar empresa (usa `updateCompany` con validación de rol owner/admin).

### 5.3. `src/app/api/companies/[companyId]/members/route.ts`
- `GET`: listar miembros (requiere membresía en la empresa).

### 5.4. `src/app/api/companies/[companyId]/invitations/route.ts`
- `POST`: crear invitación (usa `createInvitation` con validación de rol owner/admin).

### 5.5. `src/app/api/invitations/route.ts`
- `POST`: aceptar invitación (usa `acceptInvitation`).

## 6. Defensa en Profundidad (Aislamiento)

### 6.1. Consultas de Negocio
- Todas las funciones de servicio deben filtrar explícitamente por `companyId` cuando se proporciona un ID de empresa.
- Ejemplo: en `getAudienceById` (de F05) se añadiría `companyId` como condición si se proporciona.

### 6.2. Preparación para RLS
- Documentar en ADR-0003 (o crear) las políticas de Row Level Security para PostgreSQL.
- Aunque no se implementen en F02, dejar los scripts preparados.

## 7. Evidencia de Calidad

### 7.1. Pruebas
- **Unit**: contratos Zod, lógica de servicios.
- **Integration**: ciclo completo de empresa, miembros, invitaciones.
- **Security**: pruebas de cruce de tenant (asegurar 403/404).
- **E2E**: flujos de UI para empresa y miembros.

### 7.2. Almacenamiento de Evidencia
- Guardar logs y reportes en `docs/qa/f02/<commit>/` tras cada ejecución de pruebas.

## 8. Dependencias y Orden de Trabajo

### 8.1. Dependencias
- F01 Identity debe estar aprobado y funcionando (autenticación y sesión).
- PostgreSQL activo y migraciones Drizzle operativas.

### 8.2. Orden de Trabajo
1. Crear migraciones de base de datos para las tablas de tenant.
2. Implementar contratos Zod.
3. Implementar servicios de empresas e invitaciones.
4. Implementar helpers de autorización.
5. Crear endpoints de API.
6. Escribir pruebas unitarias y de integración.
7. Ejecutar pruebas de seguridad y E2E.
8. Generar evidencia de calidad y ejecutar gate de calidad.

## 9. Riesgos y Mitigaciones

### 9.1. Riesgo: Fugas de datos entre tenants
- Mitigación: revisar todas las consultas para asegurar filtrado por `companyId`.
- Mitigación: usar el helper `requireTenantMember` en todos los endpoints que acceden a recursos de tenant.

### 9.2. Riesgo: complejidad en la gestión de tokens de invitación
- Mitigación: usar una librería criptográfica confiable (como `crypto` de Node) para generar y verificar tokens.
- Mitigación: establecer expiración corta (48h) y uso único.

## 10. Criterios de Aceptación (desde el contrato)

Verificar cada criterio de aceptación (CA-01 a CA-08) con pruebas específicas.

-- 
Plan elaborado para la implementación del módulo F02 Multi-Tenant.