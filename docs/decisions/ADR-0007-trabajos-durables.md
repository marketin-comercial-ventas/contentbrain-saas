# ADR-0007: Trabajos durables (cola/workflow) + Vercel Cron

- **Estado:** Propuesto (evaluar en F00 y cerrar en F13)
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor → integrations-engineer

## Contexto

Publicación programada, reintentos, idempotencia y reconciliación requieren
trabajo durable. Vercel Cron es solo el disparador (MP 19).

## Decisión (intención aceptada, detalle pendiente)

- Cola/workflow durable con estados, reintentos limitados, backoff,
  idempotencia, control de concurrencia, errores recuperables/definitivos y
  recuperación manual auditada.
- Vercel Cron como trigger; el trabajo durable corresponde a la cola/workflow.
- Candidatos a evaluar en F00/F13 contra documentación oficial: Vercel
  Queues/Workflow, Inngest, QStash u otro compatible con el stack. La opción
  elegida y sus límites se documentan aquí; si ninguna está disponible en la
  cuenta/plan, se registra bloqueo antes de sustituir.

## Alternativas descartadas

- `setTimeout`/cron simple sin estado: pierde trabajos entre deploys.
- Prometer exactamente-una-vez extremo a extremo: imposible ante timeouts; se
  verifica antes de reintentar y se reconcilian IDs externos.

## Consecuencias

- Toda escritura + evento en la misma transacción usa patrón verificable
  (outbox).
- La disponibilidad real del servicio es un hallazgo de F00, no una suposición.
