# PETER — Modelo de Negocio y Revenue Streams
<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo define todos los flujos de ingresos de SAP y cómo se reflejan en PETER.
  Úsalo para:
  - Mapear los tipos de proyecto en la tabla `projects.type` a su revenue stream
  - Construir el módulo de analytics financiero en /app/analytics
  - Calcular el MRR (Monthly Recurring Revenue) desde retainers activos
  - Diseñar la pantalla de billing en /app/settings/billing
  - Generar propuestas comerciales con los precios correctos por tipo de servicio
  - Configurar el modelo de costos para calcular márgenes por tipo de proyecto
-->

## Los 4 Revenue Streams del Modelo 4D

### Stream 1 — Diagnósticos Estratégicos
**Tipo en DB:** `project.type = 'diagnostico'`

**Qué es:** Análisis estratégico completo de la empresa usando el motor de IA + validación del socio.

**Precio:** $70,000 – $120,000 MXN por diagnóstico

**Variables que determinan el precio:**
- Tamaño de la empresa (más grande = más complejo = más caro)
- Número de áreas a analizar (más áreas = más horas de fieldwork)
- Framework seleccionado (MECE completo vs. análisis de área específica)
- Urgencia del cliente (turnaround tiene prima del 20–30%)

**Tabla de precios sugerida:**
| Tamaño Empresa | Áreas (2–3) | Áreas (4–5) | Empresa completa |
|---------------|-------------|-------------|-----------------|
| Micro/Pequeña (<50M MXN) | $70,000 | $85,000 | No aplica |
| Mediana (50–200M MXN) | $85,000 | $95,000 | $120,000 |
| Grande (200M+ MXN) | $95,000 | $110,000 | $150,000+ |

**Costo del servicio (para calcular margen):**
- APIs de IA: $200–$800 MXN por diagnóstico (según volumen de documentos)
- Tiempo del asociado: 8–16 horas de fieldwork + 4 horas de procesamiento
- Tiempo del socio (QC): 4–8 horas
- **Margen bruto estimado:** 65–75%

**Propuesta de valor del precio:**
> "Si identificamos ineficiencias por $500K MXN en tu empresa (y normalmente encontramos más),
> el diagnóstico pagó 5x su costo en el primer año. ¿Cuánto vale saber eso?"

---

### Stream 2 — Retainers Mensuales
**Tipo en DB:** `project.type = 'retainer'` + registro en tabla `retainers`

**Qué es:** Acompañamiento estratégico mensual continuo post-diagnóstico.

**Precio:** $15,000 – $25,000 MXN por mes (contrato mínimo 3 meses)

**Incluye:**
- 2 sesiones de trabajo al mes (1 estratégica con DG + 1 operativa con equipo)
- Reporte mensual: 3 hallazgos del mes + estado de iniciativas + KPIs vs. meta
- Acceso ilimitado al Chat IA de PETER con contexto completo del cliente
- Actualización continua de KPI Monitor en la plataforma
- 1 documento de análisis específico por mes (cuando el cliente lo necesite)

**NO incluye (y se cobra por separado):**
- Implementación técnica de sistemas ($50K–$150K — ver Stream 3)
- Diagnósticos adicionales de nuevas áreas (precio de Stream 1 con descuento del 20%)
- Trabajo de campo extra (visitas adicionales a las 2 sesiones estándar)

**Tabla de precios del retainer:**
| Intensidad | Precio/mes | Incluye | Para quién |
|-----------|-----------|---------|-----------|
| Básico | $15,000 MXN | 2 sesiones/mes + plataforma | Empresa pequeña o etapa inicial |
| Estándar | $20,000 MXN | 2 sesiones/mes + plataforma + reporte mensual | La mayoría de los clientes |
| Premium | $25,000 MXN | 3 sesiones/mes + plataforma + reporte + análisis ad-hoc | Empresa grande o en transformación activa |

**Margen del retainer:** muy alto — el costo marginal de un retainer es principalmente
el tiempo del socio (4–6 horas/mes) + APIs de IA ($100–$300 MXN/mes).
Con 5 retainers activos a $20K = $100K MXN/mes con margen del 70%+.

**KPI crítico para el negocio:** MRR (Monthly Recurring Revenue) de retainers.
Este es el número que determina la salud financiera de SAP.

```typescript
// Calcular MRR en tiempo real desde retainers activos
// Usar en el dashboard de /app/analytics y en el stat card del dashboard principal
const calculateMRR = async (tenantId: string) => {
  const { data } = await supabase
    .from('retainers')
    .select('monthly_fee_mxn')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
  
  return data?.reduce((sum, r) => sum + r.monthly_fee_mxn, 0) ?? 0
}
```

---

### Stream 3 — Implementación Tecnológica
**Tipo en DB:** `project.type = 'implementacion'`

**Qué es:** Proyectos de implementación derivados del diagnóstico.
El diagnóstico identifica la oportunidad, la implementación la ejecuta.

**Precio:** $50,000 – $150,000 MXN por proyecto

**Tipos de implementación más comunes:**
| Tipo | Precio típico | Duración |
|------|--------------|---------|
| Implementación de OKRs + BSC | $50,000–$70,000 | 6–8 semanas |
| Reestructura organizacional (org design) | $60,000–$90,000 | 8–12 semanas |
| Diseño de modelo comercial (proceso ventas, CRM) | $70,000–$100,000 | 8–10 semanas |
| Transformación operativa (Lean/Six Sigma en planta) | $80,000–$150,000 | 10–16 semanas |
| Preparación para M&A / due diligence estratégico | $100,000–$150,000 | 8–12 semanas |

**Nota:** La implementación NO incluye software ni licencias de terceros.
Si el cliente necesita un ERP o CRM específico, SAP puede recomendar proveedores
pero no es el implementador tecnológico — eso es referido a un socio tecnológico.

---

### Stream 4 — Licencias SaaS (White Label)
**Tipo en DB:** `subscriptions` + `tenants.plan`

**Qué es:** Consultores independientes rentan PETER con su propia marca
para ofrecer diagnósticos de nivel internacional a sus propios clientes.

**Precios de planes:**
| Plan | Precio/mes | Clientes | Diagnósticos/mes | Para quién |
|------|-----------|---------|-----------------|-----------|
| Starter | $3,000 MXN | 5 | 3 | Consultor independiente iniciando |
| Professional | $5,000 MXN | 25 | 15 | Consultor con cartera establecida |
| Enterprise | $7,000+ MXN | Ilimitado | Ilimitado | Firma boutique / equipo de consultores |

**Modelo BYOK (Bring Your Own Keys) — Enterprise:**
El consultor Enterprise paga $7K MXN/mes por la plataforma.
Si usa sus propias API keys de Claude/GPT, no paga consumo adicional.
Si usa las de SAP, se suma el consumo real a su factura mensual.

**Proyección de ingresos por licencias (Mes 12):**
- 10 consultores Starter: $30,000 MXN/mes
- 5 consultores Professional: $25,000 MXN/mes
- 2 Enterprise: $14,000 MXN/mes
- **Total licencias: $69,000 MXN/mes con margen >85%** (costo marginal es casi cero)

---

## Modelo Financiero Simplificado

### Punto de Equilibrio por Escenario

| Escenario | Costo Fijo/mes | Break-even con solo retainers | Break-even con mix |
|-----------|---------------|------------------------------|-------------------|
| Lean (Mes 1–3) | $40,000 MXN | 2 retainers × $20K | 1 diagnóstico + 1 retainer |
| Estándar (Mes 4–6) | $70,000 MXN | 4 retainers × $20K | 2 diagnósticos + 2 retainers |
| Escalado (Mes 10+) | $125,000 MXN | 7 retainers × $20K | 1 diagnóstico + 4 retainers + 3 licencias |

### Proyección de Ingresos — Año 1

| Mes | Diagnósticos | Retainers Activos | Licencias | Ingreso Total |
|-----|-------------|-------------------|-----------|---------------|
| 1 | 1 × $85K | 0 | 0 | $85,000 |
| 2 | 1 × $85K | 1 × $20K | 0 | $105,000 |
| 3 | 2 × $90K | 2 × $20K | 0 | $220,000 |
| 4 | 2 × $90K | 3 × $20K | 1 × $3K | $243,000 |
| 6 | 3 × $95K | 5 × $20K | 3 × $3K | $394,000 |
| 9 | 4 × $95K | 7 × $20K | 6 × $4K | $564,000 |
| 12 | 5 × $100K | 10 × $20K | 12 × $4K | $748,000 |

**MRR en Mes 12 (solo recurrente):** $200K retainers + $48K licencias = $248,000 MXN/mes

---

## Costos Fijos Mensuales Detallados

### Tecnología e IA
| Concepto | Costo Mensual MXN | Notas |
|----------|------------------|-------|
| APIs de IA (Claude + GPT-4o + Gemini) | $8,000–$15,000 | Escala con uso. Inicio: ~$4,000 |
| Statista (prorrateado anual $3,500 USD) | $5,000–$7,000 | Comprar en Mes 1 |
| Perplexity Pro (2 usuarios) | $800 | $40 USD/mes × 2 |
| Fireflies.ai (2 usuarios) | $600 | $19/usuario × 2 |
| Jamie.ai (1 usuario — asociado) | $500 | $25/usuario |
| Otter.ai (complemento) | $400 | $20/usuario |
| Notion (equipo) | $400 | $16/usuario × 2 |
| Google Workspace (correo + Drive) | $400 | $12/usuario × 2 + dominio |
| Hosting PETER (Vercel + Supabase) | $500–$2,000 | Escala con usuarios. Inicio: $500 |
| **Subtotal Tecnología** | **$16,600–$26,700** | |

### Operación
| Concepto | Costo Mensual MXN | Notas |
|----------|------------------|-------|
| Asociado part-time (fieldwork + análisis) | $15,000–$25,000 | 20 hrs/semana. Escala con proyectos |
| Asistente admin / coordinador | $8,000–$12,000 | Facturación, agenda, seguimiento |
| Contador externo (honorarios) | $3,000–$5,000 | Declaraciones, IMSS |
| Abogado corporativo (prorrateado) | $2,000–$3,000 | Contratos, NDAs |
| **Subtotal Operación** | **$28,000–$45,000** | |

### Marketing y Ventas
| Concepto | Costo Mensual MXN | Notas |
|----------|------------------|-------|
| LinkedIn Premium (2 cuentas — socios) | $1,200 | $60 USD × 2 |
| Publicidad LinkedIn / Meta | $3,000–$8,000 | Solo a partir de Mes 3. Inicio: orgánico |
| Diseño (Canva Pro o freelance) | $500–$1,500 | Materiales y contenido |
| **Subtotal Marketing** | **$4,700–$10,700** | |

### Oficina y Misceláneos
| Concepto | Costo Mensual MXN | Notas |
|----------|------------------|-------|
| Oficina (coworking o renta) | $5,000–$15,000 | WeWork o similar. Inicio: home office = $0 |
| Transportación para fieldwork | $2,000–$5,000 | Visitas a clientes fuera de CDMX |
| Seguros / imprevistos | $1,000–$2,000 | Seguro de responsabilidad profesional |
| **Subtotal Oficina** | **$8,000–$22,000** | |

### Resumen por Escenario
| Escenario | Cuándo | Costo Total/mes |
|-----------|--------|----------------|
| **Lean** — sin oficina, 1 asociado, home office | Mes 1–3 | **$35,000–$45,000 MXN** |
| **Estándar** — asociado + admin + coworking | Mes 4–6 | **$57,000–$80,000 MXN** |
| **Escalado** — equipo completo + oficina formal | Mes 10+ | **$100,000–$150,000 MXN** |

---

## Mapeo de Revenue Streams en PETER

```typescript
// Tipos de proyecto y su impacto en el revenue tracking
export const PROJECT_TYPE_CONFIG = {
  diagnostico: {
    label: 'Diagnóstico Estratégico',
    revenueType: 'one_time',
    priceRange: { min: 70000, max: 150000 },
    currency: 'MXN',
    marginEstimate: 0.70,
  },
  retainer: {
    label: 'Retainer Mensual',
    revenueType: 'recurring',
    priceRange: { min: 15000, max: 25000 },
    currency: 'MXN',
    marginEstimate: 0.75,
  },
  implementacion: {
    label: 'Implementación',
    revenueType: 'one_time',
    priceRange: { min: 50000, max: 150000 },
    currency: 'MXN',
    marginEstimate: 0.60,
  },
  licencia: {
    label: 'Licencia SaaS',
    revenueType: 'recurring',
    priceRange: { min: 3000, max: 7000 },
    currency: 'MXN',
    marginEstimate: 0.85,
  },
} as const

// KPIs financieros que deben calcularse en tiempo real en /app/analytics
export const FINANCIAL_KPIS = [
  'mrr',                    // Monthly Recurring Revenue (retainers + licencias)
  'arr',                    // Annual Recurring Revenue (MRR × 12)
  'one_time_revenue_mtd',   // Ingresos de diagnósticos e implementaciones este mes
  'total_revenue_mtd',      // MRR + one-time del mes
  'avg_deal_size',          // Valor promedio por diagnóstico
  'avg_retainer_value',     // Valor promedio de retainers activos
  'cac',                    // Customer Acquisition Cost (marketing + ventas / nuevos clientes)
  'ltv',                    // Lifetime Value estimado por cliente
  'churn_rate',             // % de retainers cancelados en el mes
  'net_revenue_retention',  // NRR: (MRR inicial + expansión - churn) / MRR inicial
] as const
```
