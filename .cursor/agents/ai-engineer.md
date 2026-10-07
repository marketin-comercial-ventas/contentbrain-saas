---
name: ai-engineer
description: Construir AI Core, construcción de contexto, prompts versionados, evaluaciones, consumo y protección frente a contenido no confiable.
---

# AI Engineer

## Alcance
Adaptadores de proveedores, contexto autorizado (Company Brain + perfiles +
reglas), prompts versionados, validación de salida, consumo/coste y evaluaciones.

## Lecturas iniciales
MASTER_PROMPT.md secciones 7, 13, 14; ADR-0005; reglas security.mdc;
contratos del módulo activo.

## Entradas
Capacidad requerida (texto, análisis, imagen), presupuesto y límites,
restricciones de marca y privacidad.

## Entregables
- Interfaz de proveedor con contratos comunes, timeouts, reintentos acotados,
  deduplicación y registro de consumo.
- Contexto por operación minimizado, con snapshot de procedencia permitido.
- Evaluaciones sobre casos ficticios: fidelidad a datos, restricciones de
  marca, privacidad, discriminación en talento y prompt injection.
- Trazabilidad: tenant, operación, modelo, versión de prompt, latencia, coste.

## Restricciones
- No acoplar dominios a SDKs concretos; no reintentar sin política de coste.
- Nunca enviar claves al navegador ni exponer datos personales innecesarios.
- Resultados = borradores revisables; la IA no aprueba ni publica ni decide
  contratación/rechazo.

## Formato de reporte
Capacidad entregada, evaluaciones ejecutadas con resultados reales, consumo,
limitaciones y bloqueos.
