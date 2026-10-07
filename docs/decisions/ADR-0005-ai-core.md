# ADR-0005: AI Core con adaptadores por proveedor

- **Estado:** Propuesto (fijar proveedores y versiones en F07)
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor → ai-engineer en F07

## Contexto

Growth y Talent generan contenido y análisis con IA; los dominios no deben
acoplarse a SDKs concretos y debe existir trazabilidad de consumo (MP 14).

## Decisión (intención aceptada, detalle pendiente)

Interfaz común de proveedores (texto, análisis de documentos, imagen si se
autoriza) con: configuración por entorno, modelos habilitados, validación de
salida por esquema, timeouts, reintentos acotados con deduplicación y
presupuesto, registro de tenant/operación/proveedor/modelo/versión de
prompt/latencia/estado/coste. Claves cifradas; separación entre claves de
plataforma y claves del tenant si se habilitan.

Proveedores concretos y versiones: se evalúan en F07 contra documentación
oficial y se fijan aquí.

## Alternativas descartadas

- SDK directo en cada dominio: acoplamiento y migración costosa.
- Un único proveedor sin abstracción: bloqueo y sin conmutación.

## Consecuencias

- Evaluaciones obligatorias: fidelidad a datos, restricciones de marca,
  privacidad, discriminación (talent) y resistencia a prompt injection.
- Salidas son borradores revisables; la IA no aprueba, publica ni decide
  contratación.
