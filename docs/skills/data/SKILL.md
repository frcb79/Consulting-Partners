# SKILL: Datos, Analytics y Métricas

## Cuándo consultar este skill
Antes de: diseñar un dashboard, definir KPIs, implementar analytics,
o estructurar datos para reportes.

## KPIs del Negocio (deben estar en el dashboard)

### Métricas de Revenue
- MRR (Monthly Recurring Revenue) = suma de retainers + licencias activos
- ARR = MRR × 12
- One-time revenue del mes = diagnósticos + implementaciones
- Revenue total del mes = MRR + one-time

### Métricas de Crecimiento
- Nuevos clientes del mes
- Tasa de conversión diagnóstico → retainer (objetivo: >40%)
- Churn de retainers (objetivo: <5% mensual)
- NRR — Net Revenue Retention (objetivo: >110%)

### Métricas Operativas
- Diagnósticos completados en el mes
- Tiempo promedio de diagnóstico (objetivo: <72h)
- Tokens de IA consumidos y costo total
- Satisfacción del cliente (NPS — implementar en V2)

## Herramientas de Analytics

| Herramienta | Uso | Cuándo activar |
|-------------|-----|----------------|
| PostHog | Comportamiento del usuario en la plataforma | Desde V1 |
| Supabase Analytics | Uso de la base de datos | Siempre activo |
| Vercel Analytics | Performance del frontend | Desde V1 |
| Sentry | Errores en producción | Desde V1 |

## Estructura de Eventos para PostHog
```typescript
// Eventos a trackear desde el inicio
posthog.capture('diagnosis_started', { project_id, framework, client_id })
posthog.capture('diagnosis_completed', { project_id, findings_count, tokens_used, duration_ms })
posthog.capture('client_invited_to_portal', { client_id })
posthog.capture('retainer_created', { client_id, monthly_fee })
posthog.capture('report_downloaded', { project_id, format: 'pdf' })
```
