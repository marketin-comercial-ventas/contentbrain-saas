# ContentBrain SaaS - MVP

Plataforma SaaS multiempresa (multi-tenant) para Growth, Sales y Talent.

## 🚀 Estado Actual

**MVP Completado (100%)** - F00 a F07

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **F00 Foundation** | ✅ | Repo, Next.js 16, TS, Tailwind, shadcn/ui, PostgreSQL, Drizzle, CI/CD |
| **F01 Identity** | ✅ | Auth completo: register, login, logout, sesión, recuperación, RLS |
| **F02 Multi-Tenant** | ✅ | RLS policies, memberships, roles (owner/admin/member/viewer) |
| **F03 Company Brain** | ✅ | Marcas, Sucursales, Perfiles Commercial/Talent |
| **F04 Catálogo Avanzado** | ✅ | Productos, variantes, categorías, ofertas, price tiers, inventario |
| **F05 Audiencias Avanzadas** | ✅ | Segmentos, Candidate Personas, Scoring, Insights IA |
| **F06 Rules Engine** | ✅ | Reglas, workflows visuales, plantillas, ejecuciones |
| **F07 AI Core Extended** | ✅ | 7 proveedores, consumption tracking, evaluations, cache, templates |

## 🛠 Stack Tecnológico

- **Framework**: Next.js 16 (App Router) + TypeScript 5.6
- **UI**: React 19 + Tailwind CSS + shadcn/ui + lucide-react
- **Database**: PostgreSQL 17 + Drizzle ORM (type-safe)
- **Auth**: Custom JWT + scrypt + cookies httpOnly + RLS
- **Testing**: Vitest (unit/integration) + Playwright (E2E) + Security tests
- **CI/CD**: GitHub Actions + Vercel deploy
- **Package Manager**: pnpm 11 + lockfile
- **AI Providers**: OpenAI, Anthropic, Google (Gemini), Cohere, Mistral, Groq, Ollama

## 📦 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Layout autenticado + páginas dashboard
│   ├── api/               # API Routes (REST)
│   └── auth/              # Páginas auth (login, registro, etc.)
├── components/
│   ├── ui/               # shadcn/ui components
│   └── sidebar.tsx       # Navegación principal
├── modules/              # Lógica de negocio por dominio
│   ├── ai-core/         # AI Core multi-provider
│   ├── audiences/       # Audiencias, segmentos, personas
│   ├── brands/          # Marcas
│   ├── branches/        # Sucursales
│   ├── campaigns/       # Campañas
│   ├── companies/       # Empresas, membresías
│   ├── content-studio/  # Generación contenido IA
│   ├── dashboard/       # Métricas dashboard
│   ├── identity/        # Auth, sessions, passwords
│   ├── leads/           # CRM Leads
│   ├── products/        # Catálogo, variantes, ofertas
│   ├── profiles/        # Perfiles Commercial/Talent
│   ├── rules/           # Rules Engine, workflows
│   └── talent/          # ATS (vacantes, candidatos)
├── server/
│   └── db/              # Drizzle client, schema, migrations
├── shared/
│   └── contracts/       # Zod schemas compartidos (API ↔ UI)
└── lib/utils.ts         # Utilidades (cn, etc.)
```

## 🧪 Testing

```bash
# Unit tests (Vitest)
pnpm test:unit

# Integration tests (PostgreSQL real)
pnpm test:integration

# Security tests
pnpm test:security

# E2E tests (Playwright)
pnpm test:e2e

# Regression suite (all above)
pnpm test:regression

# Lint + Typecheck + Build
pnpm lint && pnpm typecheck && pnpm build
```

## 🚀 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
# Jobs paralelos: lint, typecheck, unit, build, integration, security, e2e
# Gate de calidad por módulo
# Deploy preview (PR) + Deploy production (main)
# Dependabot weekly updates
```

## 🌐 Deploy (Vercel)

1. Conectar repositorio en Vercel
2. Configurar variables de entorno (ver `.env.example`)
3. Deploy automático en push a `main`
4. Preview deployments en PRs

### Variables Requeridas (Vercel)

```env
DATABASE_URL=postgres://...
TEST_DATABASE_URL=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
# ... ver .env.example completo
```

## 🗄 Base de Datos

```bash
# Desarrollo local
pnpm db:migrate          # Aplicar migraciones
pnpm db:generate         # Generar migración tras cambios schema
pnpm db:studio           # Drizzle Studio (GUI)

# Seed datos demo
npx tsx scripts/seed.ts
```

## 📚 Documentación

- `docs/MASTER_PROMPT.md` - Especificación completa
- `docs/ARCHITECTURE.md` - Arquitectura y ADRs
- `docs/PROJECT_STATUS.md` - Estado módulos y bloqueos
- `docs/REQUIREMENTS.md` - Matriz requisitos con trazabilidad
- `docs/modules/` - Contratos por módulo
- `docs/qa/` - Evidencia QA y gates
- `docs/HANDOFF.md` - Para continuidad entre sesiones

## 🔒 Seguridad

- RLS (Row Level Security) en todas tablas tenant
- scrypt + timingSafeEqual para passwords
- Cookies httpOnly + SameSite=Lax + Secure (prod)
- Rate limiting en auth endpoints
- Validación Zod en todas las APIs
- CSP + Security headers (vercel.json)
- Auditoría de eventos sensibles

## 📈 Roadmap

| Fase | Módulo | Estado |
|------|--------|--------|
| F00-F07 | MVP Core | ✅ **DONE** |
| F08 | Media Library | 📋 Pendiente |
| F09 | Hooks + Content Studio avanzado | 📋 Pendiente |
| F10 | Campañas avanzadas | 📋 Pendiente |
| F11 | Approval Workflow | 📋 Pendiente |
| F12 | Publishing Destinations | 📋 Pendiente |
| F13 | Publishing Queue | 📋 Pendiente |
| F14 | Calendar | 📋 Pendiente |
| F15 | Meta Integration | 📋 Pendiente |
| F16 | Sales (Leads, Oportunidades) | 📋 Pendiente |
| F17-F20 | Talent (ATS completo) | 📋 Pendiente |
| F21 | Analytics | 📋 Pendiente |
| F22 | Plans/Usage | 📋 Pendiente |
| F23 | Super Admin | 📋 Pendiente |
| F24 | Production Hardening | 📋 Pendiente |

## 🤝 Contribución

```bash
# Setup
git clone <repo>
cd proyecto
pnpm install
cp .env.example .env.local  # Configurar variables

# Desarrollo
pnpm dev

# Tests antes de commit
pnpm lint && pnpm typecheck && pnpm test:regression
```

## 📄 Licencia

Proprietary - Todos los derechos reservados.

---

**Última actualización**: 2026-10-07 | **Versión**: 0.1.0 | **Commit**: `e7e6546`