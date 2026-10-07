---
name: module-development
description: Desarrollar o corregir un modulo de esta plataforma SaaS desde su contrato hasta su entrega a QA. Usar al implementar una feature, modulo o cambio funcional.
---

# Desarrollo de módulo

Leer AGENTS.md, docs/MASTER_PROMPT.md, ADRs vigentes, PROJECT_STATUS.md,
TESTING.md y el contrato en docs/modules/<module-id>.md.

1. Confirmar módulo activo, dependencias aprobadas y alcance autorizado.
2. Inspeccionar Git y preservar cambios ajenos. No iniciar otro módulo pendiente.
3. Definir criterios verificables y relacionarlos con requisitos y pruebas.
4. Acordar aplicabilidad de pruebas con QA antes de implementar.
5. Definir contratos, permisos, entitlements, datos, estados y errores.
6. Asignar responsable único por archivo compartido; delegar tareas acotadas.
7. Implementar una sección vertical funcional con persistencia y autorización.
8. Añadir migraciones, UI, validaciones y pruebas de comportamiento necesarias.
9. Aplicar database-migration-review, tenant-security-audit e integration-review
   cuando el cambio afecte esos componentes.
10. Ejecutar los comandos reales del proyecto. Corregir fallos, sin ocultarlos.
11. Actualizar documentación, matriz de requisitos y estado a IN_REVIEW.
12. Entregar código y evidencia al revisor que aplicará module-qa.
13. Después de QA, aplicar feature-completion-gate; no aprobarse a sí mismo.

Entregar: alcance completado, archivos, contratos, migraciones, comandos/resultados,
commit de código, riesgos y bloqueos. Registrar handoff si se interrumpe el trabajo.

No cambiar stack, tenancy, auth o hosting sin ADR y autorización correspondiente.
No declarar DONE por completar pantallas, crear carpetas o escribir pruebas sin ejecutarlas.
Si hay fallos, continuar corrigiendo este módulo. Si falta acceso, registrar bloqueo.
