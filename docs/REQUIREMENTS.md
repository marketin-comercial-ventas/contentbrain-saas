# Matriz de requisitos

Formato: `REQ-ID | Requisito | Origen | Módulo | Criterio verificable | Pruebas`.
Origen: MP = MASTER_PROMPT sección indicada.

Se añaden requisitos por módulo **antes** de implementarlo; el contrato en
`docs/modules/<id>.md` referencia sus REQ. Estado de trazabilidad:
`PEND` (sin implementar) · `IMPLEMENTED` · `VERIFIED` (evidencia en QA).

## Globales

| ID | Requisito | Origen | Módulo | Criterio verificable | Pruebas | Estado |
|---|---|---|---|---|---|---|
| REQ-G-01 | Monolito Next.js + TS estricto + un único repo; sin microservicios | MP 3 | F00 | `pnpm build` y `pnpm typecheck` en CI sobre repo único | build, typecheck | VERIFIED |
| REQ-G-02 | Toda tabla de negocio con `tenant_id` y mecanismo anti-cruce | MP 5 | F02+ | Prueba negativa: recurso de tenant B inaccesible desde A en cada superficie | integration, security | PEND |
| REQ-G-03 | Autorización en servidor (sesión+membresía+permiso+entitlement) por operación | MP 5-6 | F01/F02 | Pruebas negativas de permiso y módulo desactivado | integration, security | PEND |
| REQ-G-04 | Validación de entrada en servidor con esquemas compartidos | MP 3 | F00 | Entrada inválida rechazada con error controlado | unit, integration | IMPLEMENTED |
| REQ-G-05 | Gate ejecutable: comandos reales, fallo con código ≠ 0, sin auto-aprobación | MP 35 | F00 | `pnpm quality:gate` devuelve ≠ 0 con un fallo inyectado en rama de validación | gate control | VERIFIED |
| REQ-G-06 | CI ejecuta lint, tipos, unit, integración, E2E, seguridad, build y gate | MP 35 | F00 | Check obligatorio verde en el remoto o declaración documentada de pendencia | ci | PEND (bloqueo declarado: sin remoto/credenciales) |
| REQ-G-07 | Interfaz en español con i18n preparada; fechas/moneda/zona por tenant | MP 30 | F03 | Cadenas externalizadas; formato configurado por tenant | unit, e2e | PEND |
| REQ-G-08 | Ninguna prueba skipped cuenta como PASS; N/A justificado previamente | MP 35 | F00 | Salida de suites sin skips no aceptados en el reporte del gate | gate control | VERIFIED |

## F00 Foundation (contrato en `docs/modules/f00.md`)

| ID | Requisito | Origen | Módulo | Criterio verificable | Pruebas | Estado |
|---|---|---|---|---|---|---|
| REQ-F00-01 | Repo inicializado con lockfile pnpm y versiones fijadas (sin `latest` sin lock) | MP 3 | F00 | `pnpm install` reproducible; `pnpm-lock.yaml` versionado | install check | VERIFIED |
| REQ-F00-02 | App Next.js arranca y build de producción pasa | MP 3 | F00 | `pnpm build` exitoso y arranque local verificado | build, smoke | VERIFIED |
| REQ-F00-03 | PostgreSQL de pruebas real y aislado + migración inicial aplicable en base vacía y con datos | MP 35, Skill 4 | F00 | Suite de integración ejecuta contra DB aislada; migración aplicada dos veces en escenarios distintos | integration | VERIFIED |
| REQ-F00-04 | Comandos del contrato implementados de verdad (lint, typecheck, tests, build, gate) | MP 35 | F00 | Cada script invoca su herramienta; scripts contienen `echo`/`|| true` | revisión + ejecución | VERIFIED |
| REQ-F00-05 | `quality:gate` produce reporte estructurado y bloquea ante fallo o evidencia ausente | MP 35-36 | F00 | Fallo inyectado → gate ≠ 0 y FINAL STATUS no APPROVED | gate control | VERIFIED |
| REQ-F00-06 | Destino de despliegue (Vercel) verificado o bloqueo declarado con precisión | MP 37 | F00 | Build/preview real, o bloqueo documentado con dependencia concreta | e2e o bloqueo | PEND (bloqueo declarado: sin credenciales Vercel) |
| REQ-F00-07 | Evidencia de F00 guardada en `docs/qa/f00/<commit>/` con formato canónico | MP 36 | F00 | Reporte completo con todos los campos; los no ejecutados constan como tales | revisión documental | VERIFIED |

Evidencia F00: `docs/qa/f00/5c5e6f4/` (gate sobre commit limpio) y
`docs/qa/f00/5c5e6f4-dirty/` (veredicto QA independiente APPROVED, selftest
REJECTED, gate final APPROVED).

## F01 Identity (contrato en `docs/modules/f01.md`)

| ID | Requisito | Origen | Módulo | Criterio verificable | Pruebas | Estado |
|---|---|---|---|---|---|---|
| REQ-F01-01 | Registro de cuenta con email único y contraseña hasheada (scrypt) | MP 4, 37 | F01 | Usuario creado sin contraseña en claro; duplicado → 409 | unit, integration | VERIFIED |
| REQ-F01-02 | Login con sesión en cookie httpOnly; token solo hasheado en BD | MP 35 | F01 | Cookie con flags de seguridad; BD sin token en claro | integration, security | VERIFIED |
| REQ-F01-03 | Logout revoca la sesión en servidor (no solo borra cookie) | MP 35 | F01 | Tras logout, `me` → 401 con la cookie anterior | integration | VERIFIED |
| REQ-F01-04 | Recuperación de contraseña con token temporal de un solo uso; reset revoca sesiones | MP 37 | F01 | Token usado/expirado rechazado; sesiones previas invalidadas | integration | VERIFIED |
| REQ-F01-05 | Autorización base en servidor: sesión activa requerida en rutas protegidas | MP 5, 37 | F01 | `me` y helpers → 401 sin sesión o con sesión revocada | unit, integration | VERIFIED |
| REQ-F01-06 | Validación Zod compartida + rate limiting + rechazo de Origin en auth | MP 35 | F01 | 400/429/403 en casos negativos | unit, security | VERIFIED |
| REQ-F01-07 | Auditoría de eventos de autenticación en `audit_events` | MP 4 | F01 | Filas para alta, login ok/fallo y reset | integration | VERIFIED |
| REQ-F01-08 | Evidencia F01 en `docs/qa/f01/<commit>/` con formato canónico | MP 36 | F01 | Reporte completo; no ejecutados declarados | revisión documental | VERIFIED |

Evidencia F01: `docs/qa/f01/3ba7723/` (gate sobre commit limpio) y
`docs/qa/f01/3ba7723-dirty/` (veredicto QA independiente APPROVED, selftest
REJECTED, gate final APPROVED).
