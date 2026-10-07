# ADR-0004: Autenticación con biblioteca mantenida

- **Estado:** Propuesto (fijar versión en F01)
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor → domain/architect en F01

## Contexto

Cuentas, sesiones seguras, recuperación y multi-tenant. No se debe desarrollar
criptografía propia (MP sección 3).

## Decisión (pendiente de verificación)

Seleccionar y **fijar mediante ADR** una biblioteca de autenticación
mantenida y compatible con Next.js App Router + TypeScript, verificando en su
documentación oficial vigente: sesiones httpOnly, rotación/revocación, SSR
compatibility, flujo de recuperación y ausencia de almacenamiento de secretos
en cliente.

Candidatos a evaluar en F01 (no decidido): Auth.js/NextAuth, Better Auth u
otro con mantenimiento activo. La evaluación real documenta versión fijada,
límites y alternativas descartadas.

## Alternativas descartadas

- Criptografía/sesión propia: prohibida por el prompt.
- Depender de `latest` sin fijar: prohibido.

## Consecuencias

- Sesiones y usuarios viven en `src/modules/identity/` + `src/server/auth/`.
- F01 no puede cerrarse sin este ADR en estado Aceptado con versión concreta.
