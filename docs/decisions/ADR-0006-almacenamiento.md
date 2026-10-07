# ADR-0006: Almacenamiento privado mediante adaptador

- **Estado:** Propuesto (fijar proveedor en F08)
- **Fecha:** 2026-10-06
- **Responsable:** Supervisor → integrations-engineer en F08

## Contexto

Media Library con archivos de marca (publicables) y documentos privados (CV,
identificaciones, contratos) con permisos, ciclo de vida y descargas de duración
limitada (MP 18).

## Decisión (intención aceptada, detalle pendiente)

Adaptador de almacenamiento en `src/server/storage/` con interfaz única
(subida con validación de tipo/contenido, URLs firmadas de corta duración,
borrado de derivados, versiones y procedencia). Proveedores a evaluar en F08
según acceso privado, región y límites: Vercel Blob o compatible con S3.

## Alternativas descartadas

- Sistema de archivos local como producto: no sirve en Vercel y rompe
  multi-instancia.
- URLs públicas permanentes para documentos privados: inaceptable.

## Consecuencias

- Los permisos de dominio se aplican antes de emitir la URL; una URL opaca no
  es autorización.
- Retención/borrado deben cubrir miniaturas, índices y respuestas IA derivadas.
