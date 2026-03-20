# PETER — Biblioteca de Frameworks Estratégicos
<!-- 
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo contiene todos los frameworks de consultoría que PETER puede aplicar.
  Úsalo para:
  - Generar los prompts de análisis por framework en lib/ai/prompts/
  - Poblar el selector visual de frameworks en el wizard de nuevo diagnóstico
  - Construir la lógica de selección de framework según industria y situación del cliente
  - Generar las descripciones y tooltips de cada framework en el UI
-->

## Contexto de Uso
Cada framework en esta biblioteca es un "producto" que PETER puede ofrecer.
Cuantos más frameworks estén codificados como prompts maestros, más industrias y situaciones
podemos atacar. El campo `framework` en la tabla `projects` debe aceptar cualquier
clave de esta lista.

---

## A. Estrategia Corporativa y Dirección General

| Framework | Qué Analiza | Cuándo Usarlo | Nivel | Clave DB |
|-----------|-------------|---------------|-------|----------|
| MECE (Mutually Exclusive Collectively Exhaustive) | Descomposición de problemas sin traslapes ni huecos | Siempre — es la base de todo análisis Bain | Dirección | `mece` |
| Full Potential Transformation (Bain) | Brecha entre desempeño actual y potencial máximo | Diagnósticos de empresa completa, turnaround | Dirección | `full_potential` |
| Pirámide de Minto / Pyramid Principle | Estructurar hallazgos con lógica deductiva | Construcción de reportes y presentaciones | Dirección | `pyramid` |
| McKinsey 7S Framework | Alineación: Strategy, Structure, Systems, Staff, Skills, Style, Values | Reestructura organizacional, post-fusión | Dirección | `mckinsey_7s` |
| Porter's Five Forces | Atractivo de la industria y fuerzas competitivas | Análisis de mercado, entrada a nuevos segmentos | Dirección | `porter_five` |
| SWOT / FODA | Fortalezas, Oportunidades, Debilidades, Amenazas | Inicio de cualquier diagnóstico estratégico | Gerencial | `foda` |
| PESTEL / PESTLE | Factores Políticos, Económicos, Sociales, Tecnológicos, Ambientales, Legales | Empresas en expansión, análisis macro | Dirección | `pestel` |
| Blue Ocean Strategy | Crear nuevos espacios de mercado sin competencia | Empresas con crecimiento estancado | Dirección | `blue_ocean` |
| Balanced Scorecard (BSC) | 4 perspectivas: Financiera, Cliente, Procesos, Aprendizaje | Implementación de estrategia y KPIs | Gerencial | `bsc` |
| Ansoff Matrix | 4 estrategias: Penetración, Desarrollo de Mercado, Producto, Diversificación | Empresas en busca de crecimiento | Dirección | `ansoff` |
| GE-McKinsey Matrix | Portfolio de unidades por atractivo de industria y fuerza competitiva | Corporativos con múltiples líneas | Dirección | `ge_mckinsey` |
| BCG Growth-Share Matrix | Stars, Cash Cows, Question Marks, Dogs | Empresas con múltiples productos | Gerencial | `bcg_matrix` |
| Three Horizons of Growth (McKinsey) | 3 horizontes: defender, ampliar, crear | Planeación estratégica largo plazo | Dirección | `three_horizons` |
| Value Chain Analysis (Porter) | Actividades primarias y de soporte que crean valor | Optimización de operaciones y márgenes | Gerencial | `value_chain` |
| Business Model Canvas (BMC) | 9 bloques del modelo de negocio | Startups, pivots, evaluación de modelo | Gerencial | `bmc` |
| Jobs To Be Done (JTBD) | Qué trabajo contrata el cliente al comprar tu producto | Innovación de producto, propuesta de valor | Gerencial | `jtbd` |
| Playing to Win (Lafley & Martin) | 5 elecciones: aspiración, dónde jugar, cómo ganar, capacidades, sistemas | Definición de estrategia competitiva | Dirección | `playing_to_win` |

---

## B. Frameworks Financieros

| Framework | Qué Mide | Cuándo Usarlo | Clave DB |
|-----------|----------|---------------|----------|
| Profitability Framework | Revenue vs. Costs — dónde se pierde o gana dinero | Márgenes bajos, diagnóstico financiero rápido | `profitability` |
| DuPont Analysis (RONA Tree) | Descomposición de ROE: margen, rotación, apalancamiento | Análisis profundo de rentabilidad | `dupont` |
| Break-Even Analysis | Punto de equilibrio entre ingresos y costos | Lanzamiento de nuevos productos, expansión | `break_even` |
| Working Capital Optimization | Ciclo de conversión: CxC, CxP, inventarios | Problemas de liquidez sin pérdida de ventas | `working_capital` |
| EBITDA Bridge | Diferencia entre EBITDA de un período y otro, causa por causa | Análisis de variación de márgenes | `ebitda_bridge` |
| Discounted Cash Flow (DCF) | Valor presente de flujos futuros | Valuaciones, decisiones de inversión | `dcf` |
| Economic Value Added (EVA) | Valor creado por encima del costo del capital | Empresas con capital intensivo, manufactura | `eva` |
| Zero-Based Budgeting (ZBB) | Presupuesto desde cero sin asumir gastos anteriores | Reducción de costos estructurales | `zbb` |
| Scenario Planning | 3 escenarios: optimista, base, pesimista | Incertidumbre alta, decisión de inversión | `scenario_planning` |
| Monte Carlo Simulation | Probabilidad de diferentes resultados financieros | Proyecciones con alta variabilidad | `monte_carlo` |
| Sensitivity Analysis | Cómo cambia el resultado si cambia una variable clave | Cualquier modelo financiero | `sensitivity` |
| Capital Allocation Framework | Cómo distribuir capital: dividendos, recompra, inversión, deuda | Empresas con caja excedente | `capital_allocation` |

---

## C. Frameworks de Marketing y Crecimiento

| Framework | Qué Analiza | Cuándo Usarlo | Clave DB |
|-----------|-------------|---------------|----------|
| 4Ps / Marketing Mix | Product, Price, Place, Promotion | Lanzamiento de productos, reposicionamiento | `marketing_mix` |
| 7Ps (Servicios) | Suma People, Process, Physical Evidence a las 4Ps | Empresas de servicios, consultorías | `7ps` |
| STP (Segmentation, Targeting, Positioning) | Segmentar mercado y posicionar oferta | Entrada a nuevos mercados, redefinición de cliente ideal | `stp` |
| Customer Journey Map | Experiencia completa desde awareness hasta lealtad | Mejora de experiencia, reducción de churn | `customer_journey` |
| Net Promoter Score (NPS) | Probabilidad de recomendación y lealtad | Diagnóstico de satisfacción y retención | `nps` |
| Brand Equity Model (Keller) | 4 niveles: identidad, significado, respuesta, relación | Estrategia de marca | `brand_equity` |
| Growth Hacking / AARRR | Acquisition, Activation, Retention, Referral, Revenue | Startups y empresas digitales | `aarrr` |
| Perceptual Mapping | Posicionamiento de la marca vs. competidores | Estrategia de diferenciación | `perceptual_map` |
| Account Based Marketing (ABM) | Marketing dirigido a cuentas específicas de alto valor | B2B con ciclos de venta largos | `abm` |
| CLV / LTV Analysis | Customer Lifetime Value — valor total de un cliente | Optimización de acquisition cost y retención | `clv` |

---

## D. Frameworks de Ventas

| Framework | Qué Hace | Cuándo Usarlo | Clave DB |
|-----------|----------|---------------|----------|
| SPIN Selling | Situation, Problem, Implication, Need-Payoff | Ventas consultivas B2B, tickets altos | `spin` |
| Challenger Sale | Enseñar, personalizar, tomar control | Ventas donde el cliente no sabe lo que necesita | `challenger` |
| MEDDIC / MEDDPICC | Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion | Oportunidades enterprise, ciclo largo | `meddic` |
| Value Selling Framework | Vender con ROI cuantificado, no características | Clientes que cuestionan el precio | `value_selling` |
| Solution Selling | Primero entender el problema, luego proponer solución | Servicios profesionales y consultorías | `solution_selling` |
| Sales Funnel Optimization | Conversión en cada etapa del embudo | Mejorar tasa de cierre | `sales_funnel` |
| Pipeline Velocity | Oportunidades × tasa cierre × valor promedio / ciclo | Pronóstico de ventas | `pipeline_velocity` |
| Sandler Selling System | Calificar rápido, manejar objeciones antes de presentar | Clientes que siempre dicen "lo pienso" | `sandler` |
| BANT Qualification | Budget, Authority, Need, Timeline | Primer filtro de leads | `bant` |
| Flywheel Model | Attract, Engage, Delight — círculo virtuoso | Negocios con componente de referidos | `flywheel` |

---

## E. Frameworks de Recursos Humanos y Organización

| Framework | Qué Analiza | Cuándo Usarlo | Clave DB |
|-----------|-------------|---------------|----------|
| 9-Box Talent Matrix | Desempeño vs. Potencial de cada colaborador | Evaluación de talento y sucesión | `9box` |
| OKR (Objectives & Key Results) | Objetivos ambiciosos con resultados medibles | Alinear equipos con estrategia | `okr` |
| RACI Matrix | Responsible, Accountable, Consulted, Informed | Proyectos con confusión de responsabilidades | `raci` |
| McKinsey Organizational Health Index | Salud organizacional en 9 dimensiones | Diagnóstico cultural y de liderazgo | `org_health` |
| Employee Value Proposition (EVP) | Por qué el talento querría trabajar ahí | Atracción y retención de talento clave | `evp` |
| Kotter's 8-Step Change Model | Proceso de gestión del cambio organizacional | Reestructuras, fusiones, transformaciones | `kotter` |
| Culture Web (Johnson) | 6 elementos de la cultura organizacional | Diagnóstico cultural y transformación | `culture_web` |
| Succession Planning Framework | Identificación y desarrollo de líderes internos | Empresas con riesgo de concentración en fundador | `succession` |
| HR Scorecard | KPIs de RH ligados a resultados de negocio | Medir impacto del área de RH | `hr_scorecard` |
| Organizational Network Analysis (ONA) | Redes de influencia informales | Cambios culturales, identificar influenciadores reales | `ona` |

---

## F. Frameworks de Operaciones y Procesos

| Framework | Qué Hace | Cuándo Usarlo | Clave DB |
|-----------|----------|---------------|----------|
| Lean / Toyota Production System | Eliminación de desperdicios (MUDA) | Manufactura, servicios con procesos repetitivos | `lean` |
| Six Sigma / DMAIC | Define, Measure, Analyze, Improve, Control | Calidad, reducción de errores | `six_sigma` |
| Theory of Constraints (TOC) | Identificar y explotar el cuello de botella | Operaciones con capacidad limitada | `toc` |
| Process Mapping / Value Stream Map | Visualizar flujo de valor de inicio a fin | Diagnóstico de procesos, automatización | `vsm` |
| OEE (Overall Equipment Effectiveness) | Disponibilidad × Rendimiento × Calidad | Manufactura, plantas industriales | `oee` |
| SCOR Model | Supply Chain Operations Reference | Logística, distribución, nearshoring | `scor` |
| S&OP (Sales & Operations Planning) | Alinear demanda con capacidad productiva | Manufactura con múltiples clientes | `sop` |
| Kaizen / Mejora Continua | Mejoras incrementales lideradas por el equipo | Cultura de mejora, post-diagnóstico | `kaizen` |
| 5S Methodology | Sort, Set, Shine, Standardize, Sustain | Plantas, bodegas, oficinas | `5s` |
| SIPOC | Suppliers, Inputs, Process, Outputs, Customers | Mapeo inicial de cualquier proceso | `sipoc` |
| Digital Twin | Réplica digital de operaciones para simular escenarios | Manufactura avanzada, nearshoring 4.0 | `digital_twin` |
| Total Cost of Ownership (TCO) | Costo real de una decisión incluyendo costos ocultos | Decisiones de inversión, make vs. buy | `tco` |

---

## G. Frameworks para Toma de Decisiones

| Framework | Cómo Ayuda | Cuándo Usarlo | Clave DB |
|-----------|-----------|---------------|----------|
| MECE Decision Tree | Árbol de decisión sin traslapes | Cualquier decisión compleja con múltiples opciones | `mece_tree` |
| Cost-Benefit Analysis | Comparar costos vs. beneficios cuantificados | Inversiones, proyectos, cambios de proceso | `cost_benefit` |
| Decision Matrix (Weighted Criteria) | Puntuar opciones con criterios ponderados | Selección de proveedor, mercado, socio | `decision_matrix` |
| Eisenhower Matrix | Urgente vs. Importante | Agenda directiva, gestión del tiempo | `eisenhower` |
| Pre-Mortem Analysis | Imaginar que el proyecto falló y buscar causas | Antes de lanzar proyecto o inversión | `pre_mortem` |
| Second-Order Thinking | Consecuencias de las consecuencias | Decisiones estratégicas de alto impacto | `second_order` |
| Regret Minimization Framework (Bezos) | Qué decisión me haría arrepentirme menos en 10 años | Grandes apuestas estratégicas | `regret_min` |
| RAPID Decision Framework (Bain) | Recommend, Agree, Perform, Input, Decide | Decisiones con múltiples stakeholders | `rapid` |
| OODA Loop | Observe, Orient, Decide, Act | Entornos volátiles, PYMEs en crisis | `ooda` |
| Risk Matrix | Probabilidad vs. Impacto de cada riesgo | Evaluación de riesgos en proyectos | `risk_matrix` |

---

## H. Frameworks para Expansión Internacional, Exportaciones y Nearshoring

| Framework | Qué Analiza | Para Quién | Clave DB |
|-----------|-------------|------------|----------|
| Market Entry Strategy Framework | Modos de entrada: exportación, JV, subsidiaria, distribuidor, licencia | Empresas expandiéndose a EE.UU., LATAM | `market_entry` |
| CAGE Distance Framework | Cultural, Administrative, Geographic, Economic — barreras reales | Selección de mercado objetivo internacional | `cage` |
| Diamond Model (Porter) | Ventajas competitivas de un país o región | Empresas extranjeras evaluando entrar a México | `diamond` |
| Nearshoring Readiness Assessment | Infraestructura, talento, costos, riesgos de una ubicación | Compañías T1/T2 buscando expandirse | `nearshoring` |
| Total Landed Cost Model | Costo real de importar/exportar con aranceles y logística | Evaluación de proveedores internacionales | `landed_cost` |
| USMCA / T-MEC Compliance Framework | Reglas de origen y requisitos del tratado | Manufactura con cliente en EE.UU. o Canadá | `usmca` |
| Political Risk Matrix | Estabilidad política, tipo de cambio, riesgo regulatorio | Inversiones en mercados emergentes | `political_risk` |
| Supply Chain Resilience Framework | Diversificación de proveedores ante disrupciones | Post-COVID, tensión comercial China-EE.UU. | `supply_resilience` |
| FDI Evaluation Framework | Foreign Direct Investment — evaluación de inversiones extranjeras | Empresas extranjeras que evalúan invertir en México | `fdi` |

---

## I. Frameworks por Etapa de la Empresa

| Etapa | Frameworks Prioritarios | Clave DB |
|-------|------------------------|----------|
| Startup / Etapa Temprana | BMC, JTBD, Lean Canvas, AARRR, Customer Discovery | `stage_startup` |
| Crecimiento / Scale-Up | OKRs, Sales Funnel, Working Capital, S&OP, Ansoff | `stage_growth` |
| Empresa Mediana Madura | Full Potential, McKinsey 7S, Value Chain, BCG Matrix, BSC | `stage_mature` |
| Empresa Familiar en Transición | Succession Planning, Culture Web, Org Health, Governance | `stage_family` |
| Expansión Internacional | CAGE, Market Entry, USMCA, Political Risk, Landed Cost | `stage_intl` |
| Turnaround / Crisis | Profitability Framework, ZBB, TOC, Pre-Mortem | `stage_turnaround` |
| Pre-M&A | Due Diligence Checklist, DCF, Synergy Assessment | `stage_ma` |

---

## Instrucciones de Implementación para Copilot

Cuando el desarrollador trabaje en `components/projects/FrameworkSelector.tsx`,
usa esta lista para:
1. Generar las cards visuales de selección de framework — mínimo los 6 de la sección principal del wizard
2. Mapear cada `clave DB` al prompt correspondiente en `lib/ai/prompts/`
3. En el campo `framework` de la tabla `projects`, validar contra estas claves
4. En el tooltip de cada framework card, mostrar: nombre, qué analiza y cuándo usarlo

Los frameworks marcados como prioritarios para V1 son:
`mece`, `full_potential`, `mckinsey_7s`, `porter_five`, `bmc`, `foda`

El resto se activan en V2 progresivamente.
