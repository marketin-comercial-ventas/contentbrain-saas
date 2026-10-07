---
name: release-check
description: Verificar preparacion de una version para despliegue y operacion. Usar antes de promover a staging o produccion, despues de los gates de los modulos incluidos.
---

# Revisión de release

Leer PROJECT_STATUS.md, ADRs, reportes QA, configuración y runbook de despliegue.

1. Identificar commit integrado y módulos incluidos; confirmar sus gates vigentes.
2. Ejecutar build y regresión del candidato integrado, con controles de seguridad.
3. Revisar secretos, variables, dominios, callbacks, scopes y separación de entornos.
4. Confirmar migraciones revisadas, backup, restauración ensayada y recuperación.
5. Verificar cola, cron, almacenamiento, límites, observabilidad y alertas.
6. Ejecutar pruebas de humo, acceso y aislamiento en el entorno de destino permitido.
7. Para producción, validar carga según escenarios/umbrales definidos previamente.
8. Comprobar flags y que ninguna integración simulada esté expuesta como operativa.
9. Documentar orden de despliegue, migración, rollback/roll-forward y responsables.
10. Verificar autorización existente para el destino; si falta, preparar la release
    revisable y solicitar únicamente esa autorización final.

Guardar reporte en docs/releases/ con commit, ambiente, evidencia y decisión.
Si hay fallo obligatorio o gate faltante, declarar NO_GO y corregir.
Si faltan acceso o aprobación de despliegue, declarar BLOCKED, no desplegar ni fingir éxito.
GO técnico no sustituye autorización del propietario para acciones externas.

Tras despliegue autorizado, verificar salud, errores, jobs y recorrido crítico.
Si falla la verificación, ejecutar el plan de recuperación autorizado y registrar incidente.
No afirmar que una release pasó pruebas que solo se planearon.
