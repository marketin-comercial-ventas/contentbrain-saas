---
name: feature-completion-gate
description: Aplicar el cierre obligatorio de cualquier feature, modulo o integracion, verificando evidencia y QA independiente antes de DONE o del siguiente modulo. Usar siempre que se pretenda declarar terminado, integrar como aprobado o avanzar.
---

# Feature Completion Gate

Leer AGENTS.md, MASTER_PROMPT.md secciones de pruebas/gate, contrato del módulo,
REQUIREMENTS.md, PROJECT_STATUS.md y evidencia QA del commit evaluado.

1. Identificar alcance, criterios, commit de código y entorno exactos.
2. Verificar requisitos originales y trazabilidad de cada criterio a su evidencia.
3. Ejecutar o verificar artefactos inmutables de la misma versión para lint y typecheck.
4. Verificar ejecución real de unitarias, integración y E2E.
5. Verificar permisos, aislamiento, seguridad y responsive aplicables.
6. Verificar build de producción y regresión de módulos previamente aprobados.
7. Revisar consola, logs del servidor y errores de base de datos.
8. Confirmar un recorrido funcional como usuario, con persistencia y errores reales.
9. Revisar migraciones, documentación, secretos y contratos afectados.
10. Comprobar que omisiones, mocks y N/A no encubran una función o prueba pendiente.
11. Verificar reporte de QA independiente con decisión APPROVED para ese código.
12. Solicitar al Supervisor revisión y cierre técnico con evidencia.
13. Emitir el formato canónico de FEATURE COMPLETION GATE / MODULE GATE.
14. Registrar resultado y referencias en PROJECT_STATUS.md.

## Condiciones de aprobación

- Todos los criterios aplicables pasan con evidencia reproducible.
- N/A solo tiene la aplicabilidad justificada y aceptada antes de la ejecución.
- Una prueba no ejecutada o skipped nunca cuenta como PASS.
- No hay hallazgos bloqueantes, dependencias pendientes ni revisión independiente ausente.
- QA y Supervisor aprueban el commit validado, no una versión anterior.
- Cambios funcionales posteriores invalidan el gate y requieren nueva validación.

## Resultado

Si una comprobación obligatoria falla:
FINAL STATUS: REJECTED
Next module allowed: NO
Marcar el módulo QA_FAILED y devolverlo a corrección.

Si falta evidencia, entorno, credenciales o revisión:
FINAL STATUS: BLOCKED
Next module allowed: NO
Conservar un estado permitido del módulo y registrar blocked: true con motivo.
No crear un estado de módulo BLOCKED fuera del vocabulario de PROJECT_STATUS.md.

Solo con QA DECISION: APPROVED y Supervisor decision: APPROVED:
FINAL STATUS: APPROVED
Next module allowed: YES
El Supervisor registra DONE y habilita el siguiente módulo.

Guardar reporte, comandos, resultados, entorno, commit y responsables en docs/qa/.
No aceptar frases como "ya está implementado" como prueba de funcionamiento.
No rebajar criterios, borrar pruebas ni simular revisores para conseguir aprobación.
Si el gate se bloquea, seguir trabajando en la corrección del módulo activo.
La velocidad nunca justifica omitir este procedimiento.
