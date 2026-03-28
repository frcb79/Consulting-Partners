# SKILL: Operaciones y Procesos Internos

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
Antes de: documentar un proceso nuevo, diseñar un flujo de onboarding,
o definir SLAs de respuesta.

## Procesos Operativos de SAP

### Onboarding de Nuevo Consultor (tenant)
1. SAP crea el tenant manualmente en Super Admin
2. Invita al consultor por email (magic link de primer acceso)
3. Consultor configura su perfil y branding (V2: White Label)
4. SAP hace sesión de 30 min de capacitación en PETER
5. Consultor hace su primer diagnóstico con cliente real

### SLA de Respuesta
- Diagnóstico entregado: máx 72 horas desde kickoff
- Respuesta a mensajes del cliente: máx 24 horas hábiles
- Tiempo de inactividad de PETER: objetivo <0.1% (Vercel + Supabase garantizan >99.9%)
- Respuesta a bugs críticos: 2 horas en horario hábil

### Proceso de QC de Reportes
1. Motor IA genera hallazgos → status: processing
2. Consultor revisa y valida cada hallazgo → status: review
3. Socio SAP revisa el reporte completo → aprobación
4. Se genera el PDF y se marca como listo para entrega → status: delivered
5. Regla: ningún reporte sale sin validación del socio

### Monitoreo de la Plataforma
- Sentry: alertas de errores en tiempo real → canal de Slack #alerts
- Supabase Dashboard: uso de DB y Storage → revisar semanal
- Vercel Analytics: performance y errores de build → revisar en cada deploy
- PostHog: comportamiento de usuarios → revisar semanal
