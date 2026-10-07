# HANDOFF

Se actualiza al interrumpir una sesión y al retomarla. El agente que continue
**verifica** el estado real (Git, PROJECT_STATUS, evidencia) antes de seguir;
no confía en este resumen por sí solo.

## Sesión en curso

| Campo | Valor |
|---|---|
| Fecha | 2026-10-06 |
| Módulo activo | F00 Foundation (no iniciado) |
| Última tarea | Bootstrap documental |
| Commit | `c10f93a` (commit inicial) + pendiente de commit del bootstrap completo |
| Cambios locales | AGENTS.md, `.cursor/rules/*.mdc` (7), `.cursor/agents/*.md` (10), docs de control, ADRs — ver `git status` |
| Decisiones tomadas | Skills instaladas en `.cursor/skills/` (canónica) y `.opencode/skills/` (copia opencode); identidad Git local `opencode <opencode@localhost>` |
| Pruebas ejecutadas | Ninguna (no existe `package.json`; comandos del contrato aún no implementados) |
| Gate | No ejecutado |
| Bloqueos | Ninguno |
| Siguiente acción permitida | Commit del bootstrap → contratar F00: crear `docs/modules/f00.md`, pedir requisitos/contrato y ejecutar Foundation con evidencia |

## Plantilla para futuras sesiones

```text
Fecha:
Módulo activo / estado:
Commit (código):
Cambios locales sin commitear:
Decisiones nuevas (ADR si aplica):
Pruebas realmente ejecutadas (comando + resultado):
Gate: NO EJECUTADO | APPROVED | REJECTED | BLOCKED
Bloqueos (dependencia concreta):
Siguiente acción concreta:
```
