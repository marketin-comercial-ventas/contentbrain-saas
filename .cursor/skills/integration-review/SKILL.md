---
name: integration-review
description: Validar conectores externos, OAuth, webhooks, almacenamiento, IA y trabajos durables. Usar antes de integrar o cambiar un proveedor y sus flujos de datos o acciones.
---

# Revisión de integraciones

Leer contrato del conector, ADR y documentación oficial vigente del proveedor.
Registrar versión de API, capacidades, scopes, límites y requisitos de cuenta.

1. Verificar autorización del tenant propietario y cifrado/rotación de credenciales.
2. Probar OAuth: state, callback, expiración, revocación y permisos insuficientes.
3. Validar firmas de webhooks, antigüedad, deduplicación y tenant resuelto con confianza.
4. Probar timeout, rate limit, errores temporales/definitivos y límites de reintento.
5. Verificar idempotencia, concurrencia y reconciliación tras respuestas inciertas.
6. Revisar datos enviados, minimización, logs sanitizados y URLs privadas.
7. En IA, comprobar esquema de salida, consumo, presupuesto y contexto autorizado.
8. Separar pruebas unitarias con dobles, contratos y pruebas externas reales.
9. Ejecutar el flujo real en sandbox/cuenta de prueba cuando esté disponible y autorizado.
10. Documentar limitaciones y operaciones todavía no implementadas.

No inventar scopes, endpoints, soporte de formatos ni aprobación del proveedor.
Una simulación no equivale a publicar, enviar, cobrar o generar un activo externo.
Si faltan credenciales o permisos, emitir BLOCKED para el alcance de integración real.
Los adaptadores internos pueden aprobarse únicamente bajo un contrato de alcance distinto,
previamente acordado y sin declarar la integración completa terminada.

Entregar evidencia por escenario, IDs externos no sensibles, errores y correcciones.
No ejecutar acciones externas fuera de la autorización existente.
Enviar resultado a QA y al gate del módulo.
