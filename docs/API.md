# API Documentation - ContentBrain SaaS

Base URL: `/api`
Content-Type: `application/json`
Auth: Cookie `session` (httpOnly, SameSite=Lax, Secure en prod)

---

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login + cookie sesión |
| POST | `/api/auth/logout` | Logout (revoca sesión) |
| GET | `/api/auth/me` | Usuario actual (requiere sesión) |
| POST | `/api/auth/forgot` | Solicitar reset password |
| POST | `/api/auth/reset` | Reset password con token |

### Register
```json
POST /api/auth/register
{
  "email": "user@empresa.com",
  "password": "clave-segura-123",
  "name": "Usuario Demo"
}
```
Response 201: `{ user: { id, email, name, status } }`

### Login
```json
POST /api/auth/login
{
  "email": "user@empresa.com",
  "password": "clave-segura-123"
}
```
Response 200: `{ user: {...} }` + Cookie `session=...`

---

## Empresas (Multi-tenant)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies` | Listar empresas del usuario |
| POST | `/api/companies` | Crear empresa |
| GET | `/api/companies/:companyId` | Detalle empresa + miembros + stats |
| PATCH | `/api/companies/:companyId` | Actualizar empresa |
| DELETE | `/api/companies/:companyId` | Eliminar empresa |

### Miembros
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/members` | Listar miembros |
| POST | `/api/companies/:companyId/members` | Invitar miembro |

---

## Company Brain

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/brain` | Obtener Company Brain |
| POST | `/api/companies/:companyId/brain` | Crear/Actualizar Company Brain |

---

## Marcas (Brands)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/brands` | Listar marcas |
| POST | `/api/companies/:companyId/brands` | Crear marca |
| GET | `/api/companies/:companyId/brands/:id` | Detalle marca |
| PATCH | `/api/companies/:companyId/brands/:id` | Actualizar marca |
| DELETE | `/api/companies/:companyId/brands/:id` | Eliminar marca |

---

## Sucursales (Branches)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/branches` | Listar sucursales |
| POST | `/api/companies/:companyId/branches` | Crear sucursal |
| GET | `/api/companies/:companyId/branches/:id` | Detalle sucursal |
| PATCH | `/api/companies/:companyId/branches/:id` | Actualizar sucursal |
| DELETE | `/api/companies/:companyId/branches/:id` | Eliminar sucursal |

Query params: `?brandId=<id>` para filtrar por marca.

---

## Perfiles (Commercial/Talent)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/profiles` | Listar perfiles |
| POST | `/api/companies/:companyId/profiles` | Crear perfil |
| GET | `/api/companies/:companyId/profiles/:id` | Detalle perfil |
| PATCH | `/api/companies/:companyId/profiles/:id` | Actualizar perfil |
| DELETE | `/api/companies/:companyId/profiles/:id` | Eliminar perfil |

Query params: `?brandId=<id>&branchId=<id>` para filtrar.

---

## Productos (Catálogo)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/products` | Listar productos |
| POST | `/api/companies/:companyId/products` | Crear producto |
| GET | `/api/companies/:companyId/products/:id` | Detalle producto |
| PATCH | `/api/companies/:companyId/products/:id` | Actualizar producto |
| DELETE | `/api/companies/:companyId/products/:id` | Eliminar producto |

### Variantes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/products/:id/variants` | Listar variantes |
| POST | `/api/companies/:companyId/products/:id/variants` | Crear variante |

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/categories` | Listar categorías |
| POST | `/api/companies/:companyId/categories` | Crear categoría |

---

## Ofertas / Promociones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/offers` | Listar ofertas |
| POST | `/api/companies/:companyId/offers` | Crear oferta |
| GET | `/api/companies/:companyId/offers/:id` | Detalle oferta |
| PATCH | `/api/companies/:companyId/offers/:id` | Actualizar oferta |
| DELETE | `/api/companies/:companyId/offers/:id` | Eliminar oferta |

---

## Audiencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/audiences` | Listar audiencias |
| POST | `/api/companies/:companyId/audiences` | Crear audiencia (manual o IA) |
| GET | `/api/companies/:companyId/audiences/:id` | Detalle audiencia |
| PATCH | `/api/companies/:companyId/audiences/:id` | Actualizar audiencia |
| DELETE | `/api/companies/:companyId/audiences/:id` | Eliminar audiencia |

### Generar con IA
```json
POST /api/companies/:companyId/audiences
{
  "generateWithAI": true,
  "brief": "Empresas B2B medianas que necesitan automatizar marketing",
  "productId": "uuid-opcional"
}
```

### Segmentos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/audiences/:id/segments` | Listar segmentos |
| POST | `/api/companies/:companyId/audiences/:id/segments` | Crear segmento |

### Candidate Personas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/candidate-personas` | Listar personas |
| POST | `/api/companies/:companyId/candidate-personas` | Crear persona |

---

## Content Studio (IA)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/content` | Listar contenidos generados |
| POST | `/api/companies/:companyId/content` | Generar contenido con IA |
| GET | `/api/companies/:companyId/content/:id` | Detalle contenido |
| PATCH | `/api/companies/:companyId/content/:id` | Editar/Regenerar/Guardar |
| DELETE | `/api/companies/:companyId/content/:id` | Eliminar contenido |

### Generar
```json
POST /api/companies/:companyId/content
{
  "type": "post",
  "objective": "Generar engagement para lanzamiento",
  "channel": "instagram",
  "tone": "profesional",
  "productId": "uuid",
  "audienceId": "uuid",
  "campaignId": "uuid",
  "variantsCount": 3
}
```

---

## Campañas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/campaigns` | Listar campañas |
| POST | `/api/companies/:companyId/campaigns` | Crear campaña |
| GET | `/api/companies/:companyId/campaigns/:id` | Detalle campaña |
| PATCH | `/api/companies/:companyId/campaigns/:id` | Actualizar campaña |
| DELETE | `/api/companies/:companyId/campaigns/:id` | Eliminar campaña |

---

## Leads / CRM

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/leads` | Listar leads (filtros: status, campaignId) |
| POST | `/api/companies/:companyId/leads` | Crear lead |
| GET | `/api/companies/:companyId/leads/:id` | Detalle lead |
| PATCH | `/api/companies/:companyId/leads/:id` | Actualizar lead |
| PATCH | `/api/companies/:companyId/leads/:id` | Mover lead (`{ moveOnly: true, status }`) |
| DELETE | `/api/companies/:companyId/leads/:id` | Eliminar lead |

### Pipeline Stats
GET `/api/companies/:companyId/leads` → incluye `stats` con conteo por estado.

---

## Talent / ATS

### Vacantes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/vacancies` | Listar vacantes |
| POST | `/api/companies/:companyId/vacancies` | Crear vacante |
| GET | `/api/companies/:companyId/vacancies/:id` | Detalle vacante |
| PATCH | `/api/companies/:companyId/vacancies/:id` | Actualizar vacante |
| DELETE | `/api/companies/:companyId/vacancies/:id` | Eliminar vacante |

### Candidatos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:companyId/candidates` | Listar candidatos (filtros: vacancyId, status) |
| POST | `/api/companies/:companyId/candidates` | Crear candidato |
| GET | `/api/companies/:companyId/candidates/:id` | Detalle candidato |
| PATCH | `/api/companies/:companyId/candidates/:id` | Actualizar candidato |
| PATCH | `/api/companies/:companyId/candidates/:id` | Mover candidato (`{ moveOnly: true, status }`) |
| DELETE | `/api/companies/:companyId/candidates/:id` | Eliminar candidato |

### Pipeline Stats
GET `/api/companies/:companyId/candidates` → incluye stats por estado.

---

## Dashboard

GET `/api/dashboard` → Métricas agregadas del usuario:
- Empresas con stats
- Totales globales
- Pipeline leads
- Pipeline talent
- Contenidos recientes
- Leads recientes
- Candidatos recientes

---

## Health Check

GET `/api/health` → `{ status: "ok", version, timestamp, uptime, env }`

---

## Error Responses

```json
// 400 Validation Error
{ "error": { "code": "VALIDATION", "message": "Datos inválidos", "details": [...] } }

// 401 Unauthorized
{ "error": { "code": "UNAUTHENTICATED", "message": "Sesión requerida" } }

// 403 Forbidden
{ "error": { "code": "FORBIDDEN", "message": "Sin permisos" } }

// 404 Not Found
{ "error": { "code": "NOT_FOUND", "message": "Recurso no encontrado" } }

// 409 Conflict
{ "error": { "code": "CONFLICT", "message": "Email ya registrado" } }

// 429 Rate Limited
{ "error": { "code": "RATE_LIMITED", "message": "Demasiadas peticiones", "retryAfterMs": 60000 } }

// 500 Internal Error
{ "error": { "code": "INTERNAL", "message": "Error interno" } }
```

---

## Rate Limits

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/auth/register` | 20 | 1 min |
| `/api/auth/login` | 10 | 1 min |
| `/api/auth/forgot` | 5 | 10 min |
| `/api/auth/reset` | 10 | 1 min |

---

## Códigos de Error Comunes

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION` | 400 | Datos de entrada inválidos |
| `UNAUTHENTICATED` | 401 | Sin sesión o token inválido |
| `FORBIDDEN` | 403 | Sin permisos (RLS, roles) |
| `NOT_FOUND` | 404 | Recurso no existe |
| `CONFLICT` | 409 | Duplicado (email, slug, etc.) |
| `RATE_LIMITED` | 429 | Excedido límite de peticiones |
| `INVALID_TOKEN` | 400 | Token reset inválido/expirado |
| `INVALID_CREDENTIALS` | 401 | Email/password incorrectos |
| `BAD_ORIGIN` | 403 | Origin no permitido |
| `INTERNAL` | 500 | Error interno del servidor |

---

## Webhooks (Futuro)

| Evento | Payload |
|--------|---------|
| `lead.created` | `{ lead, companyId }` |
| `lead.status_changed` | `{ lead, oldStatus, newStatus }` |
| `candidate.created` | `{ candidate, vacancyId }` |
| `candidate.status_changed` | `{ candidate, oldStatus, newStatus }` |
| `content.generated` | `{ content, companyId }` |
| `rule.executed` | `{ ruleId, executionId, status }` |