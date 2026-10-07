# TESTING

## Estado actual

**Los comandos del contrato todavía no existen.** No hay `package.json`; se
crean e implementan en F00. Hasta entonces, cualquier ejecución debe
declararse NO EJECUTADA, nunca PASS.

## Contrato de comandos (implementar en F00)

```text
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:security
pnpm test:regression
pnpm build
pnpm quality:gate
```

Reglas de implementación:

- Scripts que efectivamente ejecuten las herramientas. Prohibido `echo`,
  scripts vacíos, `--passWithNoTests`, `|| true` o cualquier máscara.
- `quality:gate` agrega resultados, devuelve código ≠ 0 ante fallo o evidencia
  ausente, produce reporte estructurado y **no** autoemite aprobación de QA.
- La regresión protege módulos ya aprobados; reutiliza resultados del mismo
  commit/entorno/ejecución, nunca pruebas antiguas tras cambios relevantes.

## Estrategia

| Nivel | Herramienta | Notas |
|---|---|---|
| Unitarias | Vitest | Reglas, estados, utilidades |
| Componentes | Testing Library | Estados y flujos de UI |
| Integración | PostgreSQL real aislado | Nunca dobles para validar SQL/RLS |
| E2E | Playwright | Recorrido crítico por módulo |
| Seguridad | suite `test:security` | Aislamiento tenant, permisos, entradas |
| Regresión | suite existente | Módulos previamente aprobados |

Notas de entorno:

- Integración: cada ejecución crea y borra una base `app_test_*` dedicada
  contra `TEST_DATABASE_URL` (servicio PostgreSQL local) o, si no está
  definida, `embedded-postgres` (requiere sesión no administradora en
  Windows). Nunca se toca una base con datos de producción.
- Regresión en F00: re-ejecución completa de las suites (no hay módulos
  previos que proteger); desde F01, comparar con la evidencia del último
  módulo aprobado (hallazgo QA F-05 de F00).

## Política de aplicabilidad

- Acordar aplicabilidad con QA **antes** de implementar.
- `N/A` solo para categorías fuera de alcance, justificadas y aceptadas antes
  de ejecutar; no equivale a "no pude probar".
- Ninguna prueba omitida, skipped o pendiente cuenta como PASS.
- Foundation prueba arranque/configuración, conexión/migración aislada y un
  E2E mínimo. El aislamiento completo es obligatorio desde F02.
- No exigir pruebas de funciones aún inexistentes.

## Caminos a cubrir

Felices y negativos: entrada inválida, sin sesión, permiso insuficiente,
módulo desactivado, cruce de tenant, cambios simultáneos, reintentos, error
de proveedor y pérdida de conexión cuando corresponda.

## Evidencia

`docs/qa/<module-id>/<commit>/`: entorno, versiones, comandos, fecha,
resultados, omitidas, hallazgos, responsables. Formato del gate:
MASTER_PROMPT sección 36; skill `feature-completion-gate`.
