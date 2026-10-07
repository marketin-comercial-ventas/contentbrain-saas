---
name: module-qa
description: Revisar independientemente un modulo, reproducir criterios de aceptacion y emitir un veredicto QA con evidencia. Usar antes del cierre de cualquier modulo o tras una correccion rechazada.
---

# QA independiente

Leer AGENTS.md, contrato del módulo, matriz de requisitos, TESTING.md y política
del gate en MASTER_PROMPT.md. Revisar el código real y su diff.

1. Identificar commit, entorno, alcance y decisiones previas de aplicabilidad.
2. Comprobar que el revisor no sea quien implementó el cambio evaluado.
3. Reproducir el flujo del usuario y contrastar todos los criterios de aceptación.
4. Ejecutar lint, typecheck, unitarias, integración, E2E, build y regresión.
5. Ejecutar verificaciones aplicables de permisos, tenants, seguridad y responsive.
6. Revisar consola, logs de servidor, errores de datos y artefactos de ejecución.
7. Probar fallos, entradas inválidas, acceso indebido y operaciones repetidas.
8. Verificar que los mocks no se presenten como validación de integración real.
9. Registrar comandos, resultados, tests omitidos, hallazgos y evidencia sanitizada.
10. Emitir APPROVED solo con todos los requisitos aplicables demostrados.

Guardar reporte en docs/qa/<module-id>/<commit>/ o enlazar artefactos CI inmutables.
Explicar cada hallazgo con pasos de reproducción, impacto y resultado esperado.
Si un criterio falla, emitir REJECTED y devolverlo al implementador.
Si falta entorno/evidencia o revisión independiente, dejar el gate BLOCKED.

No cambiar pruebas para hacerlas pasar ni escribir una aprobación ficticia.
Una prueba skipped, no ejecutada o sin aserciones útiles no demuestra cumplimiento.
N/A necesita la justificación por fase aceptada antes de la ejecución.
Tras correcciones, revisar la nueva versión y repetir verificaciones afectadas y regresión.
QA no declara DONE: remitir el veredicto al Supervisor y al feature-completion-gate.
