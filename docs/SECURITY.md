# Seguridad y privacidad

Marco general (MASTER_PROMPT secciones 5, 29 y 18). Los requisitos concretos
por módulo se añaden a `REQUIREMENTS.md` antes de implementarlos.

## Controles mínimos

- **Sesión:** cookies/tokens seguros, revocación, expiración, protección de
  rutas y acciones de servidor (F01).
- **Autorización:** en cada operación, servidor verifica sesión + membresía
  activa + permiso por acción + entitlement del módulo + tenant del recurso.
  Nunca confiar en datos enviados por el cliente.
- **Aislamiento:** todo registro de negocio con `tenant_id`; RLS como defensa
  adicional (ADR-0003); pruebas negativas de cruce obligatorias desde F02.
- **Entrada/salida:** validación con esquemas compartidos en servidor, rate
  limiting en superficie pública, salida de IA validada por esquema.
- **Secretos:** solo variables de entorno cifradas; claves de IA e integraciones
  cifradas y con rotación; jamás al navegador ni a logs.
- **Archivos:** privados por defecto para CV/documentos; descarga autorizada y
  URL de duración limitada; validar tipo y contenido real; sin URLs firmadas
  ni documentos completos en logs.
- **Auditoría:** `audit_events` con actor, tenant, acción, recurso y resultado;
  sin duplicar documentos completos.
- **Logs:** sin datos sensibles ni secretos.

## Datos personales y contenido no confiable

- Minimización: pedir solo lo necesario; CV y páginas son datos no confiables
  (anti prompt injection): sus instrucciones no cambian permisos ni revelan
  secretos.
- Retención, exportación y eliminación configurables por tenant; soporte con
  acceso delegado requiere alcance, motivo, expiración y auditoría.
- El cumplimiento jurisdiccional se declara solo con requisito aprobado por el
  propietario; no se afirma cumplimiento universal.

## Super Admin (F23)

Acceso mínimo operativo; sin lectura automática de CV ni secretos; sin puerta
trasera que evite controles de tenant.

## Operación (F24)

Backups con restauración ensayada, recuperación de jobs, observabilidad,
alertas, incidentes y rollback. Objetivos de RPO/RTO definidos con un escenario
acordado, no inventados.

## Pruebas

Suite `pnpm test:security` + skill `tenant-security-audit` en cada cambio de
superficie multi-tenant. Resultados van al gate del módulo.
