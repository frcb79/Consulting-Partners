# PETER — Fuentes de Información e Inteligencia de Mercado
<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo define todas las fuentes de datos que PETER usa para enriquecer diagnósticos.
  Úsalo para:
  - Poblar el campo `source` en la tabla `documents` (los valores válidos están en este archivo)
  - Construir la UI de la Biblioteca de Inteligencia en /app/documents/library
  - Generar las categorías y etiquetas del repositorio de documentos
  - Incluir citas de fuentes correctas en los reportes generados por IA
  - Calcular el costo de suscripciones en el modelo de costos del negocio
-->

## Principio de Uso
Las fuentes se combinan en capas. Claude/GPT analizan los documentos del cliente +
estudios de mercado subidos a la biblioteca + datos en tiempo real vía búsqueda web.
La calidad del diagnóstico depende directamente de la calidad de las fuentes utilizadas.

---

## A. Fuentes de Pago — Tier 1 (las que usan McKinsey, Bain, BCG)

| Plataforma | Qué Tiene | Costo Aprox. USD/año | Prioridad SAP | `source` en DB |
|-----------|-----------|---------------------|---------------|----------------|
| **Statista** | 80,000+ tópicos, 22,500 fuentes, 150 países, exportable a PPT | $3,500–$5,000 | 🔴 ALTA — adquirir primero | `statista` |
| **IBISWorld** | 1,500+ reportes de industria, proyecciones 5 años, benchmarks | $3,000–$8,000 | 🔴 ALTA — excelente para México | `ibisworld` |
| **Euromonitor Passport** | Consumidores, industrias, 210 países, 30+ sectores | $8,000–$15,000 | 🟡 MEDIA — evaluar Mes 6+ | `euromonitor` |
| **PitchBook / Crunchbase Pro** | M&A, venture capital, valuaciones privadas | $8,000–$20,000 | 🟢 BAJA — solo si hacemos M&A | `pitchbook` |
| **Bloomberg Terminal** | Datos financieros en tiempo real, índices, tipo de cambio | $25,000–$30,000 | ⛔ NO — demasiado caro para inicio | `bloomberg` |
| **S&P Global Market Intelligence** | Estados financieros, ratings, análisis de industrias | $10,000+ | 🟢 BAJA — alternativa: Refinitiv | `sp_global` |
| **Gartner Research** | Tecnología, IT, mercado de software y SaaS | $5,000–$30,000 | 🟡 MEDIA — si entramos a verticales tech | `gartner` |
| **Mintel** | Mercados de consumo, comportamiento del shopper | $5,000–$12,000 | 🟢 BAJA — relevante para Retail | `mintel` |
| **GlobalData** | Energía, healthcare, retail — reportes sectoriales profundos | $5,000–$15,000 | 🟢 BAJA | `globaldata` |

### Estrategia de adquisición recomendada:
- **Mes 1–3:** Solo Statista + fuentes gratuitas. Cubre 70% de los casos de diagnóstico.
- **Mes 4–6:** Agregar IBISWorld cuando tengamos 3+ clientes activos.
- **Mes 7+:** Evaluar Euromonitor si entramos a Retail o Consumo masivo.

---

## B. Fuentes Gratuitas de Alto Valor

| Fuente | Tipo de Datos | URL | `source` en DB |
|--------|--------------|-----|----------------|
| **INEGI** | PIB, inflación, empleo, industria manufacturera, censo económico | inegi.org.mx | `inegi` |
| **Banxico** | Tipo de cambio, inflación, tasas, balanza comercial | banxico.org.mx | `banxico` |
| **SE — Secretaría de Economía** | Comercio exterior, inversiones, nearshoring, tratados | economia.gob.mx | `se_mexico` |
| **IMSS / STPS** | Empleo formal, salarios, accidentes de trabajo | imss.gob.mx | `imss` |
| **Banco Mundial** | Indicadores de desarrollo, doing business por país | data.worldbank.org | `world_bank` |
| **FMI / IMF Data** | Proyecciones económicas globales, deuda, tipo de cambio | imf.org/en/Data | `imf` |
| **McKinsey Global Institute** | Reportes públicos de industria y tendencias globales | mckinsey.com/mgi | `mckinsey_public` |
| **BCG Henderson Institute** | Tendencias estratégicas y reportes públicos de BCG | bcg.com/publications | `bcg_public` |
| **Harvard Business Review** | Artículos de estrategia, gestión, liderazgo | hbr.org | `hbr` |
| **CEPAL** | Datos económicos de América Latina | cepal.org/es/datos | `cepal` |
| **Trading Economics** | Datos macroeconómicos de 196 países en tiempo real | tradingeconomics.com | `trading_economics` |
| **CBRE / JLL Reports** | Real estate comercial, industrial, nearshoring — reportes trimestrales | cbre.com.mx | `cbre` |
| **ProMéxico** | Estadísticas de exportaciones e inversiones de México | gob.mx/promexico | `promexico` |
| **Google Scholar** | Papers académicos de estrategia y negocios | scholar.google.com | `google_scholar` |
| **Statista (versión free)** | Acceso limitado — suficiente para datos puntuales de contexto | statista.com | `statista_free` |

---

## C. Herramientas de Investigación con IA

| Herramienta | Uso en PETER | Costo | `source` en DB |
|-------------|-------------|-------|----------------|
| **Perplexity Pro** | Investigación web profunda con citas verificadas en tiempo real | $20 USD/mes | `perplexity` |
| **Claude (web search)** | Búsqueda integrada durante el análisis, datos actualizados | Incluido en plan | `claude_search` |
| **ChatGPT + Browsing** | Complemento de investigación rápida | $20 USD/mes | `chatgpt_browse` |

---

## D. Categorías de la Biblioteca en PETER

Estas son las categorías que aparecen en `/app/documents/library`.
El campo `type` + `source` en la tabla `documents` define dónde aparece cada archivo.

```typescript
// Categorías de la biblioteca — usar en LibrarySearch.tsx y DocumentCard.tsx
export const LIBRARY_CATEGORIES = [
  { id: 'market_study',    label: 'Estudios de Mercado',         icon: 'BarChart2',    sources: ['statista', 'ibisworld', 'euromonitor', 'mintel'] },
  { id: 'government',      label: 'Fuentes Gobierno México',     icon: 'Landmark',     sources: ['inegi', 'banxico', 'se_mexico', 'imss', 'promexico'] },
  { id: 'international',   label: 'Organismos Internacionales',  icon: 'Globe',        sources: ['world_bank', 'imf', 'cepal'] },
  { id: 'consulting_pub',  label: 'Publicaciones de Consultoras',icon: 'BookOpen',     sources: ['mckinsey_public', 'bcg_public', 'hbr'] },
  { id: 'real_estate',     label: 'Real Estate e Industrial',    icon: 'Building2',    sources: ['cbre', 'jll'] },
  { id: 'tech_research',   label: 'Tecnología e IT',             icon: 'Cpu',          sources: ['gartner', 'globaldata'] },
  { id: 'web_research',    label: 'Investigación Web (IA)',      icon: 'Search',       sources: ['perplexity', 'claude_search', 'chatgpt_browse'] },
  { id: 'internal',        label: 'Internos SAP',                icon: 'FolderLock',   sources: ['internal'] },
] as const
```

---

## E. Cómo Citar Fuentes en los Reportes

Cuando Claude genere un hallazgo basado en datos externos, debe citar la fuente así:

```
Hallazgo: "El margen EBITDA promedio de la industria manufacturera Tier 2 en México
es de 14.2% según datos de IBISWorld (2025)..."

Recomendación: "Según INEGI, el empleo formal en manufactura creció 8.3% en 2024,
lo que indica disponibilidad de talento en la región..."
```

**Regla de oro para Copilot:** nunca incluyas en el reporte una cifra sin fuente.
Si no hay fuente verificable, el dato debe marcarse como "estimación interna" o eliminarse.

---

## F. Modelo de Costos de Fuentes (para pricing de diagnósticos)

| Fuente | Costo mensual prorrateado | Incluido en precio del diagnóstico |
|--------|--------------------------|-----------------------------------|
| Statista Pro | $350–$420 USD/mes | Sí — distribuido entre diagnósticos del mes |
| IBISWorld (Mes 4+) | $250–$670 USD/mes | Sí |
| Perplexity Pro (2 usuarios) | $40 USD/mes | Sí |
| INEGI / Banxico / fuentes gratis | $0 | Sí |
| **Total fuentes por diagnóstico** | ~$50–$150 MXN por diagnóstico | Absorbido en precio base |

El costo de fuentes representa menos del 2% del precio de un diagnóstico ($70K–$120K MXN).
No es un costo variable significativo — se amortiza fácilmente con 3+ diagnósticos al mes.
