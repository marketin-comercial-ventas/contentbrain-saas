# ADR-0001: Monolito modular Next.js

- **Estado:** Aceptado
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor (decisión del propietario, MP sección 3)

## Contexto

Plataforma SaaS multiempresa con dominios Growth, Sales y Talent que deben
compartir infraestructura, autenticación, tenancy y coste operativo bajo.

## Decisión

Una sola aplicación Next.js (App Router) con TypeScript estricto, un único
repositorio y dominios desacoplados dentro de `src/modules/`. Despliegue
previsto en Vercel.

## Alternativas descartadas

- Microservicios por dominio: complejidad de despliegue, red y consistencia
  desproporcionada para el tamaño inicial.
- Apps separadas (monorepo multi-app): duplica auth, tenancy y CI.

## Consecuencias

- Un deploy y un CI para todo. Los límites de dominio dependen de disciplina
  de imports (reglas `architecture.mdc`) y no de procesos separados.
- Escalar por dominio futuro exige nuevo ADR.
