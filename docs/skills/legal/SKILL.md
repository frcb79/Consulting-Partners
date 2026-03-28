# SKILL: Legal, Privacidad y Compliance

## Metadata Operativa
- Version: 1.1.0
- Owner: SAP Product + Tech Lead
- Ultima revision: 2026-03-28
- Frecuencia de revision: mensual

## Activadores (Use when)
- Si el request menciona formularios, componentes interactivos o publicacion a produccion.
- Si hay riesgo de incumplir usabilidad, accesibilidad o calidad de experiencia.

## Inputs Minimos
- Objetivo de la tarea.
- Restricciones tecnicas y de negocio.
- Datos o artefactos disponibles.
- Fecha objetivo y owner.

## Output Obligatorio
1. Diagnostico breve.
2. Recomendaciones priorizadas.
3. Riesgos con mitigacion.
4. Plan de 30 dias con owner y KPI.

## Definition of Done
- [ ] Incluye decision recomendada y justificacion.
- [ ] Incluye KPI o criterio de exito medible.
- [ ] Incluye riesgos y mitigaciones.
- [ ] Incluye proximos pasos accionables.

## No Hacer
- No dar recomendaciones genericas sin contexto.
- No omitir riesgos, trade-offs o limitaciones.
- No cerrar sin una decision sugerida.

## Bloque Ejecutivo Estandar (siempre al cierre)
- Supuestos:
- Riesgos:
- Decision recomendada:
- Plan 30 dias:

## Ejemplos del Repositorio
- src/app/login/page.tsx
- src/app/api/diagnostics/[id]/execute/route.ts
- src/lib/supabase/middleware.ts

## Cuándo consultar este skill
Antes de: recopilar datos personales, integrar pagos, publicar la plataforma,
redactar términos de servicio, o manejar datos de clientes de los consultores.

## Marco Legal Aplicable (México)

### LFPDPPP — Ley Federal de Protección de Datos Personales
- **Aviso de Privacidad:** obligatorio antes de recopilar cualquier dato personal
- **Consentimiento:** explícito para datos sensibles (financieros, laborales)
- **Derechos ARCO:** Acceso, Rectificación, Cancelación, Oposición — deben ser ejercibles
- **Responsable:** SAP es responsable de los datos que recopila de sus clientes
- **Encargados:** Los consultores (tenants) son encargados de los datos de sus clientes

### Lo que PETER debe tener antes de lanzar
- [ ] Aviso de privacidad en el sitio web y en el registro
- [ ] Términos y Condiciones del servicio SaaS
- [ ] Política de cookies (si usas analytics)
- [ ] Contrato de procesamiento de datos con tenants (DPA)
- [ ] Proceso documentado para atender solicitudes ARCO

### Datos que se recopilan y su tratamiento
| Dato | Propósito | Retención | Base legal |
|------|-----------|-----------|-----------|
| Nombre y email del consultor | Cuenta de usuario | Mientras la cuenta esté activa | Contrato |
| Documentos de clientes del consultor | Diagnóstico | 2 años o hasta que el consultor los elimine | Contrato |
| Grabaciones de visitas | Diagnóstico | 1 año | Consentimiento |
| Datos de uso y analytics | Mejora del servicio | 2 años anonimizados | Interés legítimo |

### Contratos con Clientes
- El contrato de diagnóstico debe incluir: NDA, alcance, precio, forma de pago, IP
- El contrato de retainer: cláusula de terminación, confidencialidad, entregables
- Todos los contratos deben especificar que SAP puede usar IA para el análisis

### Propiedad Intelectual
- Los reportes generados pertenecen al cliente — SAP retiene el derecho de usar la metodología
- Los prompts y el motor de IA son IP de SAP — no compartir con clientes
- El código de PETER es confidencial — no es open source
