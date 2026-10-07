# QA independiente — F00 (Foundation) · `5c5e6f4-dirty`

- **Revisor:** qa-engineer (sesión independiente; no es el implementador)
- **Commit de código base:** `5c5e6f4` (árbol sin cambios de código tras el commit;
  `5c5e6f4-dirty` solo por la evidencia de QA nueva en `docs/qa/`, no trackeada)
- **Fecha:** 2026-10-07T12:59:10Z
- **Entorno:** win32 · node v26.8.1 · pnpm 11.23.0 · PostgreSQL 17 local
  (`TEST_DATABASE_URL` en `.env.local`, ignorado por git)
- **Decisión:** **APPROVED** (4/4 campos PASS, 6 hallazgos no bloqueantes)
- **Veredicto estructurado:** `docs/qa/f00/5c5e6f4-dirty/qa-verdict.json`

> Nota de proceso: QA no declara DONE. El gate quedará **BLOCKED** hasta que el
> Supervisor emita `--supervisor APPROVED` (política `feature-completion-gate`).

---

## 1. Qué ejecuté yo mismo (no heredé resultados)

Todos los comandos se lanzaron en esta sesión desde la raíz del repo. Resultado
(exit code) registrado aquí y en `qa-verdict.json: executedChecks`:

| Comando | Exit | Resultado observado |
|---|---|---|
| `pnpm install --frozen-lockfile` | 0 | lockfile sincronizado («Already up to date») |
| `pnpm lint` | 0 | `eslint . --max-warnings 0` sin avisos |
| `pnpm typecheck` | 0 | `tsc --noEmit` sin errores |
| `pnpm test:unit` | 0 | 5 archivos / **21 tests PASSED**, 0 skips |
| `pnpm test:integration` | 0 | base dedicada `app_test_1791377496434_2493c1` creada y **eliminada**; 5 tests reales |
| `pnpm test:security` | 0 | 4 tests (falla con «build ausente» si no hay `.next`, no se omite) |
| `pnpm build` | 0 | Next.js 16.4.0 (Turbopack); rutas `/`, `/_not-found`, `/api/health` |
| `pnpm test:e2e` | 0 | 3 tests Chromium contra build servido en `127.0.0.1:3100` |
| `pnpm test:regression` | 0 | unit + integration + security + e2e → `regresión: PASS` |
| `pnpm quality:gate --module f00 --selftest` | **1** | `finalStatus=REJECTED`, check `unit exitCode=1` (fallo inyectado) |
| `pnpm quality:gate --module f00` (sin veredicto) | **2** | `finalStatus=BLOCKED` por evidencia ausente → no aprueba |
| `pnpm dev` + `GET /` y `GET /api/health` | 200/200 | `{"status":"ok","service":"saas-growth-talent","version":"0.1.0","timestamp":"..."}` |

Evidencia propia (copias de las salidas de mis ejecuciones del gate):
`docs/qa/f00/5c5e6f4-dirty/qa-selftest-run/` (selftest, exit 1) y
`docs/qa/f00/5c5e6f4-dirty/qa-run/` (run sin veredicto, exit 2).
La evidencia previa del implementador en `docs/qa/f00/5c5e6f4/` y
`.../5c5e6f4-dirty/selftest-run/` la usé solo como referencia y coincide con lo
que yo reproduje (mismos estados y códigos de salida).

Higiene tras la ejecución: no quedó ninguna base `app_test_*` (consulta a
`pg_database`), y `git status` quedó como al inicio (solo `docs/qa/` sin
trackear; revertí los cambios generados por `next dev` en `AGENTS.md` y
`next-env.d.ts`).

## 2. Qué inspeccioné (código y tests)

- **Gate — `scripts/quality-gate.mjs`:** no autoaprueba. Emite `APPROVED` solo
  con todo PASS **+** `qa-verdict.json` con `codeCommit` coincidente,
  `independentOfImplementer=true` y `decision=APPROVED` **+**
  `supervisorDecision=APPROVED` (`scripts/lib/gate-decision.mjs:86-103`).
  Códigos de salida: 0 aprobado / 1 rechazado / 2 bloqueado
  (`quality-gate.mjs:175-183`). Reproducido: `--selftest` → exit 1; sin
  veredicto → exit 2. El veredicto apuntando a otro commit o sin revisor
  independiente produce BLOCKED (`gate-decision.mjs:67-74`), con tests que lo
  cubren (`tests/unit/gate-decision.test.ts:99-110`).
- **Checks reales — `scripts/lib/run-checks.mjs`:** `spawnSync` del comando real
  con captura de `stdout+stderr` y `status`; un exit ≠0 es FAIL. No hay
  atajos: barrido de `|| true` en `scripts/`, `tests/`, `.github/` y
  `package.json` → 0 coincidencias; los scripts de `package.json` (líneas 13-22)
  invocan `eslint`, `tsc`, `vitest`, `playwright`, `next build` y los `.mjs`.
- **Migraciones — `scripts/lib/migrate.mjs`:** crea `schema_migrations`,
  registra `id + name + hash + applied_at`, omite aplicaciones repetidas con
  hash igual (`:61-69`) y **falla** si una migración ya aplicada fue editada
  (`:62-66`); cada aplicación va en transacción e inserta el registro
  (`:70-75`). Cubierto por unit (`tests/unit/migrate-lib.test.ts:64-78`) e
  integración real (`tests/integration/migrations.test.ts:28-54`: base vacía,
  re-ejecución `skipped`, datos previos preservados).
- **DB — `src/server/db/client.ts`:** constructor a partir de la connection
  string recibida; sin credenciales en código. `src/server/db/schema.ts`:
  `app_settings` global sin `tenant_id`, acorde al contrato.
- **Contrato health — `src/app/api/health/route.ts` + `src/shared/contracts/health.ts`:**
  payload `{status, service, version, timestamp}` validado con Zod en servidor;
  sin env/uptime/pid/host; mismo esquema lo usan servidor, unit, security y E2E.
- **Tests:** sin `.skip`/`.todo`/`xit` (barrido → 0), con aserciones reales; los
  dobles solo aparecen en `tests/unit/migrate-lib.test.ts` (unitario de
  lógica) y el comportamiento real se demuestra en integración contra
  PostgreSQL del servicio. El test de seguridad **exige** el build en vez de
  saltarse (`tests/security/initial-surface.test.ts:53-58`).
- **E2E:** `playwright.config.ts` sirve `next start --port 3100` con health como
  URL de espera; verifica `/` 200 + encabezado, contrato de `/api/health` y
  cabeceras de seguridad (`tests/e2e/smoke.spec.ts`).
- **Secretos/`.gitignore`:** barrido del repo → sin credenciales reales (solo
  defaults `localhost` en `.env.example:4`, `drizzle.config.ts:8` y
  `tests/integration/global-setup.ts:51`). `git ls-files` no contiene `.env*`;
  `git check-ignore -v` confirma `.env.local` ← `.env.*` (`.gitignore:7`),
  `.gate/` (`:14`) y `test-results/` (`:12`).

## 3. CA-01 … CA-08 contra mi propia ejecución

| CA | Veredicto | Base |
|---|---|---|
| CA-01 lockfile/versiones exactas | PASS | `pnpm install --frozen-lockfile` exit 0; `package.json` sin `latest`; `pnpm-lock.yaml` trackeado |
| CA-02 build + `pnpm dev` en `/` y `/api/health` | PASS | build exit 0; dev 200/200 con payload conforme (arriba) |
| CA-03 BD real dedicada por ejecución, vacía y con datos | PASS | log `[integration] base dedicada …`/`base eliminada`; 5 tests reales; sin residuales |
| CA-04 scripts reales (sin echo/vacíos/`|| true`) | PASS | revisión de `package.json` + barrido `|| true` → 0 |
| CA-05 gate con fallo inyectado ≠0, sin fallo y con veredicto aprueba | PASS | selftest exit 1 (REJECTED); sin veredicto exit 2 (BLOCKED); la ruta de aprobación exige veredicto + Supervisor (unit `gate-decision.test.ts:57-68`) |
| CA-06 CI local definido; protección remota pendiente | PASS (con hallazgo F-06) | `.github/workflows/ci.yml` ejecuta las 8 etapas + gate; sin remoto → bloqueo aceptado por el propietario (`docs/modules/f00.md:43-45`) |
| CA-07 evidencia canónica en `docs/qa/f00/<commit>/` | PASS | `report.json` + `report.md` canónico con todos los campos y los no ejecutados como `NOT_EXECUTED` |
| CA-08 lint y typecheck limpios en todo el repo | PASS | `pnpm lint` y `pnpm typecheck` exit 0 sobre la raíz |

Aplicabilidad: `docs/modules/f00.applicability.json` justifica los 3 N/A
(`tenantIsolation`, `permissions`, `responsive`) con `justification` y
`agreedBeforeExecution: "2026-10-06"`, coherente con las exclusiones del
contrato (`docs/modules/f00.md:40-41,105-106`) y con MASTER_PROMPT 35. El gate
los computa como N/A (`gate-decision.mjs:48-58`) y un N/A sin fecha previa
quedaría BLOCKED (`gate-decision.mjs:20-29`, test `gate-decision.test.ts:138-153`).

## 4. Hallazgos (ninguno bloqueante)

Listados con archivo:línea, impacto, reproducción y mejora esperada en
`qa-verdict.json → findings`:

1. **F-01** `drizzle.config.ts:8` — credencial localhost por defecto en el
   fallback de `DATABASE_URL` (no es un secreto real; patrón de test de
   secretos no lo cubre por ir embebida en la URL).
2. **F-02** `scripts/quality-gate.mjs:177-182` — `--allow-pending-qa` sale 0
   con `FINAL STATUS: BLOCKED`; el reporte lo declara explícitamente (no es
   aprobación), pero el exit code puede confundir a un consumidor de CI.
3. **F-03** `scripts/quality-gate.mjs:65` — versión de `embedded-postgres`
   hardcodeada en el campo `environment` del reporte.
4. **F-04** `tests/unit/gate-selftest.test.ts:5` — la inyección del selftest es
   una aserción de entorno; la detección real de fallos la cubre
   `gate-decision.test.ts`.
5. **F-05** `scripts/regression.mjs:11` — «regresión» = re-ejecución del commit
   actual (aceptable en F00, primer módulo; sin comparación histórica).
6. **F-06** `.github/workflows/ci.yml:1-6` — workflow definido pero nunca
   ejecutado en remoto; protección de checks pendiente (bloqueo aceptado y
   documentado, REQ-F00-06).

## 5. Por qué APPROVED

- Los 8 criterios del contrato se reprodujeron con mis propias ejecuciones;
  todos los comandos obligatorios salieron 0 y los dos controles de salida no
  cero del gate (fallo inyectado → 1, evidencia ausente → 2) también.
- Revisé el código del gate, del pipeline de migraciones, del contrato de
  salud y de la superficie de seguridad: no hay autoaprobación, ni secretos,
  ni tests vacíos/saltados, ni dobles presentados como validación de
  integración (los tests reales de BD corren contra PostgreSQL del servicio).
- Los 3 N/A están justificados y aceptados antes de la ejecución.
- Los 6 hallazgos son menores/informativos, no afectan a ningún criterio de
  aceptación ni a la seguridad de la superficie inicial, y todos tienen
  mejora esperada descrita.

**Remitido al Supervisor y al skill `feature-completion-gate`**: con este
veredicto el gate pasará de BLOCKED a `qaDecision=APPROVED`, pero el cierre
DONE requiere además la aprobación del Supervisor sobre `5c5e6f4-dirty`.
