---
name: tenant-security-audit
description: Auditar aislamiento entre empresas, membresias, permisos y modulos habilitados. Usar al cambiar datos, rutas, acciones, archivos, jobs, IA, busquedas, exportaciones o integraciones multi-tenant.
---

# Auditoría de aislamiento

Leer ADR de tenancy, matriz de permisos, DATA_MODEL.md y contrato del módulo.
Usar datos ficticios y PostgreSQL de pruebas con el rol real de aplicación.

1. Crear tenant A y B, miembros exclusivos, usuario multimiembro y no miembro.
2. Verificar resolución del tenant y membresía activa en servidor.
3. Intentar listar, leer, editar, eliminar y vincular recursos ajenos por IDs y filtros.
4. Probar invitaciones, cambio de tenant, revocación y solicitudes concurrentes.
5. Verificar permisos por acción y entitlements; ocultar UI no basta.
6. Inspeccionar filtros, constraints y RLS; probar que el rol no evade políticas.
7. Probar reutilización de conexiones y limpieza del contexto transaccional.
8. Comprobar relaciones compuestas que impidan referencias entre tenants.
9. Inspeccionar cachés, búsquedas, vectores, prompts, archivos, URLs y exportaciones.
10. Probar jobs y webhooks con alcance adulterado, reintentos y eventos duplicados.
11. Revisar que una respuesta tardía tras cambiar de empresa no mezcle la interfaz.
12. Confirmar que soporte/Super Admin no obtenga acceso privado implícito.

Entregar matriz de superficie, intento, resultado, evidencia y vulnerabilidad encontrada.
Cualquier lectura, escritura, inferencia de datos privados o referencia entre tenants
no autorizada es un fallo bloqueante. Corregir y añadir prueba de regresión.

No considerar seguro un recurso solo por utilizar UUID o una URL difícil de adivinar.
No ejecutar ataques sobre datos reales ni exportar información personal en reportes.
Enviar resultados a QA; esta auditoría no sustituye el gate general.
