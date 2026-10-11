# Plan de Implementación: F03 Company Brain

Este plan detalla los pasos para implementar el módulo F03 Company Brain según el contrato en `docs/modules/f03.md`.

## 1. Esquema de Base de Datos

### 1.1. Tablas
- **company_brain**
  - id (PK, UUID)
  - companyId (FK → companies.id)
  - name (String)
  - description (String)
  - industry (String)
  - valueProposition (String)
  - targetAudience (String)
  - tone (String)
  - version (Integer)
  - createdBy (FK → usuarios.id)
  - approvedBy (FK → usuarios.id, nullable)
  - createdAt (Timestamp)
  - updatedAt (Timestamp)
  - isApproved (Boolean)

- **brain_versions**
  - id (PK, UUID)
  - companyBrainId (FK → company_brain.id)
  - version (Integer)
  - name (String)
  - description (String)
  - industry (String)
  - valueProposition (String)
  - targetAudience (String)
  - tone (String)
  - createdBy (FK → usuarios.id)
  - createdAt (Timestamp)
  - isApproved (Boolean)

- **brain_audiences** (opcional, para futura expansión)
  - id (PK, UUID)
  - companyBrainId (FK → company_brain.id)
  - audienceId (FK → audiences.id) [asumiendo que F05 Audiences existirá]
  - createdAt (Timestamp)

- **audit_events** (extensión)
  - Añadir columna `company_id` (FK → companies.id) para eventos de company brain
  - Añadir columna `brain_id` (FK → company_brain.id) opcional
  - Añadir columna `action` (String: CREATE, UPDATE, APPROVE, REJECT)
  - Añadir columna `performed_by` (FK → usuarios.id)
  - Añadir columna `details` (JSONB para metadatos)

### 1.2. Migraciones
- Usar Drizzle para crear las tablas
- Scripts en `drizzle/` o mediante `drizzle-kit`

## 2. Contratos Zod

### 2.1. Archivo: `src/shared/contracts/company-brain.ts`
- Esquemas para:
  - Creación de company brain (todos los campos obligatorios excepto version, createdBy, approvedBy, createdAt, updatedAt, isApproved)
  - Actualización de company brain (campos opcionales, pero manteniendo version control)
  - Aprobación de company brain (sin campos adicionales, solo cambiar estado)
  - Rechazo de company brain (volver a estado borrador)
  - Filtros para obtener versiones (opcional: limit, offset)

## 3. Servicios de Negocio

### 3.1. Módulo: `src/modules/company-brain/`
- **service.ts**
  - `createCompanyBrain(data, userId)`: crea company brain asociado a companyId y userId como creador
  - `getCompanyBrainById(id, userId?)`: obtiene company brain por ID, opcionalmente validando pertenencia a empresa
  - `getCompanyBrainByCompanyId(companyId, userId?)`: obtiene el brain activo (aprobado si existe, sino el borrador más reciente) de una empresa
  - `getCompanyBrainVersions(companyId, userId?)`: obtiene historial de versiones de un company brain
  - `updateCompanyBrain(id, data, userId)`: actualiza company brain creando una nueva versión (incrementando version)
  - `approveCompanyBrain(id, userId)`: marca company brain como aprobado, estableciendo approvedBy y approvedAt
  - `rejectCompanyBrain(id, userId)`: rechaza company brain, volviéndolo a estado borrador (manteniendo versión actual)
  - `deleteCompanyBrain(id, userId)`: elimina company brain (solo si no está aprobado o con permisos especiales)

## 4. Endpoints de API

### 4.1. `src/app/api/companies/[companyId]/brain/route.ts`
- `GET`: obtener brain actual (usa `getCompanyBrainByCompanyId` con validación de membresía)
- `POST`: crear o actualizar brain (usa `createCompanyBrain` o `updateCompanyBrain` según exista brain previo)

### 4.2. `src/app/api/companies/[companyId]/brain/approve/route.ts`
- `POST`: aprobar brain actual (usa `approveCompanyBrain` con validación de rol owner/admin)

### 4.3. `src/app/api/companies/[companyId]/brain/reject/route.ts`
- `POST`: rechazar brain actual (usa `rejectCompanyBrain` con validación de rol owner/admin)

### 4.4. `src/app/api/companies/[companyId]/brain/versions/route.ts`
- `GET`: obtener historial de versiones (usa `getCompanyBrainVersions` con validación de membresía)

## 5. Integración con módulos existentes

### 5.1. Referencias integrales
- En lugar de almacenar nombres de productos/audiencias como texto libre, almacenar IDs que referencien a entidades en módulos futuros (F04 Catálogo, F05 Audiences)
- Cuando esos módulos no existan aún, permitir texto libre como fallback pero preparando la estructura para referencias futuras

### 5.2. Helper para obtener brain activo
- Crear función `getActiveCompanyBrain(companyId)` que retorne el brain aprobado si existe, sino el borrador más reciente

## 6. Defensa en Profundidad (Aislamiento)

### 6.1. Consultas de Negocio
- Todas las funciones de servicio deben filtrar explícitamente por `companyId` cuando se proporciona un ID de empresa
- Validar que el usuario tenga membresía en la empresa antes de permitir operaciones

### 6.2. Validación de permisos
- Solo usuarios con rol `owner` o `admin` pueden crear/actualizar/aprobar/rechazar company brain
- Usuarios con rol `member` o `viewer` solo pueden leer el brain activo

## 7. Evidencia de Calidad

### 7.1. Pruebas
- **Unit**: contratos Zod, lógica de servicios, versionado
- **Integration**: ciclo completo de creación, edición, aprobación, rechazado, versionado
- **Security**: pruebas de acceso no autorizado (usuarios sin permiso, otros tenants)
- **E2E**: flujos de UI para company brain: creación, edición, aprobación, visualización

### 7.2. Almacenamiento de Evidencia
- Guardar logs y reportes en `docs/qa/f03/<commit>/` tras cada ejecución de pruebas

## 8. Dependencias y Orden de Trabajo

### 8.1. Dependencias
- F02 Multi-Tenant debe estar aprobado y funcionando (autenticación, gestión de empresas y miembros)
- PostgreSQL activo y migraciones Drizzle operativas

### 8.2. Orden de Trabajo
1. Crear migraciones de base de datos para las tablas de company brain
2. Implementar contratos Zod
3. Implementar servicios de company brain
4. Implementar endpoints de API
5. Escribir pruebas unitarias y de integración
6. Ejecutar pruebas de seguridad y E2E
7. Generar evidencia de calidad y ejecutar gate de calidad

## 9. Riesgos y Mitigaciones

### 9.1. Riesgo: Inconsistencia en versionado
- Mitigación: usar transacciones para asegurar que crear nueva versión y actualizar current sean atómicos
- Mitigación: validar que version siempre incrementa correctamente

### 9.2. Riesgo: Confusión entre borrador y versión aprobada
- Mitigación: mantener campos claros `isApproved`, `approvedBy`, `approvedAt`
- Mitigación: helper específico para obtener brain activo según reglas de negocio

### 9.3. Riesgo: Referencias futuras a otros módulos
- Mitigación: diseñar esquemas flexibles que permitan tanto texto libre como referencias
- Mitigación: documentar claramente planes de migración cuando F04/F05 estén disponibles

## 10. Criterios de Aceptación (desde el contrato)

Verificar cada criterio de aceptación (CA-01 a CA-12) con pruebas específicas.