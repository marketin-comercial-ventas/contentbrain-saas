# ADR-0009: Contratos públicos entre dominios

- **Estado:** Aceptado
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor + architect (MP sección 31)

## Contexto

Monolito con múltiples dominios (Growth, Sales, Talent y core): sin reglas
claras, los imports directos acoplan y rompen cambios futuros.

## Decisión

- Cada dominio expone contratos públicos (tipos, servicios y eventos) desde su
  punto de entrada; prohibido importar detalles internos de otro dominio.
- Contratos compartidos (esquemas de validación, tipos de tenant/permisos)
  viven en `src/shared/`.
- Consumidor y productor de eventos declaran idempotencia y propietario de
  datos. Si una operación persiste y emite evento en la misma transacción, se
  usa patrón verificable (outbox) para no perderlo.
- Ejemplo de servicio inter-dominio: Talent solicita contenido a Growth a
  través de un contrato que entrega solo datos autorizados de la vacante, sin
  acceso a expedientes.

## Alternativas descartadas

- Imports libres dentro del monolito: degrada rápido con este alcance.
- Mensajería externa desde el inicio: innecesaria en F00; el outbox prepara el
  camino sin cambiar de arquitectura.

## Consecuencias

- El revisor de arquitectura valida imports en cada PR/módulo.
- Romper un contrato público exige ADR o un plan de compatibilidad.
