# SKILL: Analisis de Metricas y Reporteo para Consultoria

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

## Cuando consultar este skill
Antes de: presentar resultados al cliente, revisar performance mensual,
detectar desviaciones, o tomar decisiones comerciales y operativas.

## Objetivo
Definir, calcular e interpretar metricas clave para que el consultor y SAP tomen
decisiones rapidas, con evidencia y foco en rentabilidad sostenible.

## Niveles de Reporte
- Diario: salud operativa (alertas)
- Semanal: ejecucion y productividad
- Mensual: resultados de negocio y decisiones de inversion
- Trimestral: estrategia y re-priorizacion

## Metricas Minimas Obligatorias

### 1) Revenue y Rentabilidad
- MRR
- ARR
- Revenue one-time
- Revenue total
- Margen bruto por servicio
- Margen operativo

### 2) Embudo Comercial
- Leads nuevos
- Discovery calls realizadas
- Propuestas enviadas
- Win rate
- Conversion diagnostico -> retainer
- Ticket promedio

### 3) Entrega y Operacion
- Diagnosticos iniciados/completados
- Tiempo promedio de diagnostico
- % entregas dentro de SLA
- Horas facturables vs no facturables
- Utilizacion del consultor

### 4) Cliente y Calidad
- NPS / satisfaccion
- Tasa de renovacion de retainer
- Churn logo y churn revenue
- Incidencias criticas por cliente
- Tiempo promedio de resolucion

### 5) IA y Eficiencia
- Tokens consumidos por cliente/proyecto
- Costo IA por diagnostico
- Costo IA como % del ingreso
- Tasa de reintentos por error de modelo

## Diccionario de KPIs (formulas)
- MRR = suma de ingresos recurrentes mensuales activos
- ARR = MRR * 12
- Win Rate = negocios ganados / propuestas enviadas
- Conversion D->R = retainers cerrados / diagnosticos entregados
- Utilizacion = horas facturables / horas totales disponibles
- Margen Bruto = (ingresos - costo directo) / ingresos
- Churn Revenue = ingreso perdido del mes / MRR inicial del mes

## Umbrales de Decision (sugeridos)
- Conversion diagnostico -> retainer < 30%: revisar propuesta de valor y pricing
- Churn mensual > 5%: activar plan de retencion inmediato
- Utilizacion < 65%: problema comercial o de asignacion
- Costo IA > 12% del ingreso del servicio: optimizar prompts/modelo
- SLA cumplido < 90%: reforzar capacidad y estandarizacion

## Formato de Reporte Ejecutivo (mensual)

```markdown
# Reporte Mensual de Consultoria

## Resumen Ejecutivo
- Resultado del mes:
- Principales avances:
- Principales riesgos:

## 1) Revenue
| KPI | Actual | Meta | Variacion |
|-----|--------|------|-----------|

## 2) Embudo comercial
| KPI | Actual | Mes anterior | Variacion |
|-----|--------|--------------|-----------|

## 3) Operacion
| KPI | Actual | Meta | Estado |
|-----|--------|------|--------|

## 4) Cliente y calidad
| KPI | Actual | Meta | Estado |
|-----|--------|------|--------|

## 5) IA y eficiencia
| KPI | Actual | Meta | Estado |
|-----|--------|------|--------|

## 6) Acciones del siguiente mes
1. Accion, owner, fecha, impacto esperado
2. Accion, owner, fecha, impacto esperado
3. Accion, owner, fecha, impacto esperado
```

## Checklist de Calidad del Reporte
- [ ] Todas las metricas tienen definicion y formula
- [ ] Se comparan actual vs meta vs periodo anterior
- [ ] Se identifican causas, no solo sintomas
- [ ] Cada hallazgo tiene accion asignada con owner y fecha
- [ ] Existe semaforo de riesgos (rojo/ambar/verde)
