# SKILL: Orquestador Estrategico y Planeador de Negocio

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
Antes de: definir estrategia trimestral, priorizar iniciativas, decidir roadmap,
o alinear objetivos entre SAP, consultores y clientes.

## Objetivo
Traducir vision de negocio en un plan ejecutable de 90 dias con foco en impacto,
riesgo y capacidad operativa real.

## Resultado Esperado (siempre)
1. Diagnostico de situacion actual (baseline)
2. Objetivos trimestrales (3-5 maximo)
3. Portafolio priorizado de iniciativas
4. Plan de ejecucion por oleadas (30/60/90 dias)
5. Riesgos y mitigaciones
6. KPIs de seguimiento con metas

## Marco de Planeacion (90 dias)

### Paso 1: Baseline
- Estado comercial: pipeline, conversion, churn, margen
- Estado operativo: capacidad del consultor, tiempos de entrega, cuellos de botella
- Estado producto: estabilidad, deuda tecnica, features criticas faltantes
- Estado financiero: MRR, flujo de caja, costo de adquisicion, margen por servicio

### Paso 2: Definir Norte
- North Star Metric (1)
- Objetivos de negocio (3-5)
- Restricciones explicitas: presupuesto, equipo, tiempo, compliance

### Paso 3: Priorizacion de Iniciativas
Usar matriz Impacto x Esfuerzo x Riesgo:
- Impacto: 1-5
- Esfuerzo: 1-5
- Riesgo: 1-5
- Score recomendado: (Impacto * 2) - Esfuerzo - Riesgo

Clasificacion:
- Score >= 5: ejecutar en los proximos 30 dias
- Score 3-4: preparar y ejecutar en 60 dias
- Score <= 2: backlog o descartar

### Paso 4: Plan 30/60/90
- 0-30 dias: quick wins de revenue y estabilidad
- 31-60 dias: automatizaciones y mejora de conversion
- 61-90 dias: escalamiento, estandarizacion y expansion

### Paso 5: Gobernanza
- Cadencia semanal: seguimiento operativo
- Cadencia quincenal: revision de iniciativas
- Cadencia mensual: revision ejecutiva de KPIs y decisiones de portfolio

## Checklist de Calidad del Plan
- [ ] Cada iniciativa tiene owner, fecha y KPI
- [ ] Ninguna iniciativa inicia sin criterio de exito claro
- [ ] Existe capacidad real para ejecutar el plan
- [ ] Se definieron riesgos criticos con mitigacion
- [ ] Se alineo el plan entre SAP y consultores

## Plantilla de Salida Recomendada

```markdown
# Plan Estrategico 90 dias

## 1) Baseline actual
- Revenue mensual:
- Conversion diagnostico -> retainer:
- Churn:
- Tiempo promedio de entrega:

## 2) Objetivos del trimestre
1. Objetivo A (meta numerica)
2. Objetivo B (meta numerica)
3. Objetivo C (meta numerica)

## 3) Iniciativas priorizadas
| Iniciativa | Impacto | Esfuerzo | Riesgo | Score | Owner | Inicio | Fin |
|-----------|---------|----------|--------|-------|-------|--------|-----|

## 4) Plan 30/60/90
- 30 dias:
- 60 dias:
- 90 dias:

## 5) Riesgos y mitigacion
- Riesgo 1 -> Mitigacion
- Riesgo 2 -> Mitigacion

## 6) KPIs y tablero de seguimiento
- KPI 1 (meta)
- KPI 2 (meta)
- KPI 3 (meta)
```
