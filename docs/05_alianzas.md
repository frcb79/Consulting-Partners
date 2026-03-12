# PETER — Programa de Alianzas y Comisionistas
<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo define la red de aliados y el programa de comisiones de SAP.
  Úsalo para:
  - Construir el campo `lead_source` en la tabla `clients` con los valores correctos
  - Generar el módulo de tracking de referidos en /app/analytics
  - Calcular comisiones automáticamente al crear un proyecto de un cliente referido
  - Diseñar el portal de comisionistas (V2) donde el aliado ve sus referidos y pagos
  - Generar los textos de propuesta de alianza para enviar a despachos y consultores
-->

## Lógica del Programa
Cada despacho contable, firma legal, banco y consultor independiente que conocemos
tiene clientes que necesitan exactamente lo que ofrecemos. Ellos son nuestra fuerza
de ventas indirecta — sin costo fijo para SAP hasta que generen un ingreso real.

**Regla de oro:** La alianza debe beneficiar al aliado SIN canibalizar su negocio actual.
SAP hace consultoría estratégica. Los contadores hacen contabilidad. Los abogados hacen derecho.
Nadie le quita trabajo al otro.

---

## A. Tipos de Aliados y Por Qué Tiene Sentido Para Cada Uno

### 1. Despachos Contables / CPA
**Por qué les conviene a ellos:**
Sus clientes siempre tienen problemas de negocio que van más allá de lo fiscal y contable.
Ellos no pueden resolverlos sin salirse de su rol. SAP completa su oferta sin competirles.

**Por qué nos conviene a nosotros:**
Tienen acceso a los estados financieros reales del cliente — conocen el verdadero estado
de la empresa antes de que cualquier otro consultor entre. Son la fuente más calificada.

**Tipo de cliente que refieren:**
Empresas medianas con problemas de margen, crecimiento estancado o estructura débil.

**Valor en DB:** `lead_source: 'aliado_contador'`

**Script de primer contacto:**
> "Estimado [nombre], sé que tus clientes a veces tienen problemas de negocio que van
> más allá de lo fiscal — márgenes que no cuadran, crecimiento estancado, decisiones
> estratégicas sin claridad. Nosotros hacemos exactamente eso, con metodología de Bain
> y motor de IA. Cuando llegue un cliente así, nosotros lo atendemos, tú recibes una
> comisión y el cliente recibe el mejor servicio. Sin riesgo para ti, sin canibalizarte.
> ¿Podemos hablar 20 minutos?"

---

### 2. Firmas Legales / Abogados Corporativos
**Por qué les conviene:**
Acompañan M&A, expansión internacional y reestructuras — todos momentos donde se necesita
un diagnóstico estratégico previo. SAP hace el diagnóstico, ellos hacen la parte legal.

**Por qué nos conviene:**
Acceso a clientes en momentos de decisión crítica: venta, fusión, expansión.
Son los momentos de mayor urgencia y mayor disposición a pagar.

**Tipo de cliente:** Empresas en M&A, expansión, reestructura legal.

**Valor en DB:** `lead_source: 'aliado_legal'`

---

### 3. Despachos Fiscales
**Por qué les conviene:**
Ven la estructura financiera completa del cliente. Saben cuándo un negocio tiene problemas
de rentabilidad o cuándo tiene excedente para invertir — antes que nadie.

**Por qué nos conviene:**
Información financiera ya validada. Clientes con urgencia de optimización.

**Tipo de cliente:** Empresas con carga fiscal alta buscando eficiencia operativa.

**Valor en DB:** `lead_source: 'aliado_fiscal'`

---

### 4. Bancos y Financieras (NAFINSA, bancos regionales, SOFOMES)
**Por qué les conviene:**
Cuando un cliente pide crédito para crecer, muchas veces no tiene un plan estratégico claro.
SAP puede diagnosticar y estructurar el plan — el banco aprueba el crédito con más confianza.

**Por qué nos conviene:**
Clientes que buscan capital para expansión = alta disposición a invertir en consultoría.
Ya tomaron la decisión de invertir en crecimiento.

**Tipo de cliente:** Empresas que buscan crédito para expansión o nearshoring.

**Valor en DB:** `lead_source: 'aliado_banco'`

---

### 5. Cámaras Empresariales (Canaco, Coparmex, Canacintra, Amis, etc.)
**Por qué les conviene:**
Sus agremiados necesitan capacitación y consultoría. SAP puede hacer talleres,
conferencias y diagnósticos grupales — el evento les genera valor a sus miembros.

**Por qué nos conviene:**
Acceso masivo a cientos de empresas en una sola relación.
Credibilidad institucional que ningún consultor independiente puede comprar.

**Tipo de cliente:** PYMEs y empresas medianas de todos los sectores.

**Valor en DB:** `lead_source: 'aliado_camara'`

**Modelo de alianza diferente:**
No comisión por referido, sino **acuerdo de presentación exclusiva**:
SAP hace 1 taller gratuito para los miembros por trimestre.
A cambio, la Cámara promueve nuestros servicios en su directorio y boletines.

---

### 6. Consultores Independientes
**Por qué les conviene:**
Pueden usar PETER con su marca (licencia White Label) para entregar diagnósticos
de nivel internacional a sus propios clientes. O pueden referir proyectos que
superan su capacidad individual.

**Por qué nos conviene:**
Son fuerza de ventas indirecta + potenciales licenciatarios del SaaS.
Ya tienen la relación con el cliente — solo les falta la herramienta.

**Tipo de cliente:** Cualquier sector — ya tienen la relación construida.

**Valor en DB:** `lead_source: 'aliado_consultor'`

**Script de primer contacto:**
> "[Nombre], llevas [X] años como consultor independiente. Tienes clientes que a veces
> necesitan un nivel de análisis difícil de entregar solo. Nosotros tenemos la plataforma
> y la metodología — tú tienes la relación. Podemos trabajar de dos formas: nos refieres
> el cliente y recibes comisión, o usas nuestra plataforma con tu marca para entregar
> diagnósticos de nivel internacional. ¿Cuánto tiempo llevas trabajando sin herramientas propias?"

---

### 7. Headhunters / Firmas de Recursos Humanos
**Por qué les conviene:**
Trabajan con Directores Generales de empresas en crecimiento o reestructura.
Son exactamente los momentos de máxima necesidad de consultoría estratégica.

**Por qué nos conviene:**
Acceso a CEOs y tomadores de decisión en momentos de cambio = máxima apertura.

**Tipo de cliente:** Empresas en crecimiento acelerado, cambio de liderazgo, reestructura.

**Valor en DB:** `lead_source: 'aliado_rh'`

---

### 8. Asesores Patrimoniales y Family Offices
**Por qué les conviene:**
Administran el patrimonio de dueños de empresas medianas.
Conocen sus planes de largo plazo: vender, expandir, institucionalizar.

**Por qué nos conviene:**
Clientes con capital disponible y disposición a invertir en estrategia.
Los planes de largo plazo del dueño siempre requieren diagnóstico estratégico primero.

**Tipo de cliente:** Dueños de empresa con planes de expansión, venta o sucesión.

**Valor en DB:** `lead_source: 'aliado_patrimonial'`

---

## B. Estructura del Programa de Comisiones

| Servicio Referido | Valor del Servicio | Comisión | Cuándo se Paga | Notas |
|------------------|--------------------|----------|----------------|-------|
| Diagnóstico | $70K–$120K MXN | 10% = $7K–$12K MXN | Al cobrar al cliente | Un pago único |
| Retainer (primeros 3 meses) | $15K–$25K MXN/mes | 15% x 3 meses = $6.75K–$11.25K total | Mensual, 3 meses | Incentiva referir clientes de calidad |
| Implementación Tech | $50K–$150K MXN | 8% = $4K–$12K MXN | Al cobrar el 50% inicial | Solo proyectos cerrados |
| Licencia SaaS (consultor) | $3K–$7K MXN/mes | Mes 1 gratis para el referido + comisión mes 2 | Al cobrar mes 2 | Incentiva uso real de la plataforma |

**Estándar del mercado:** despachos contables y legales típicamente reciben 10–15%
del primer año de facturación por referido. Nuestra estructura es competitiva y simple.

---

## C. Cómo Registrar y Rastrear Aliados en PETER

```typescript
// Fuentes de lead disponibles en el campo lead_source de la tabla clients
export const LEAD_SOURCES = [
  { value: 'referido_directo',     label: 'Referido directo (persona conocida)' },
  { value: 'aliado_contador',      label: 'Despacho Contable / CPA' },
  { value: 'aliado_legal',         label: 'Firma Legal / Abogados' },
  { value: 'aliado_fiscal',        label: 'Despacho Fiscal' },
  { value: 'aliado_banco',         label: 'Banco / Financiera / NAFINSA' },
  { value: 'aliado_camara',        label: 'Cámara Empresarial' },
  { value: 'aliado_consultor',     label: 'Consultor Independiente' },
  { value: 'aliado_rh',            label: 'Headhunter / Firma de RH' },
  { value: 'aliado_patrimonial',   label: 'Asesor Patrimonial / Family Office' },
  { value: 'linkedin',             label: 'LinkedIn (orgánico)' },
  { value: 'evento',               label: 'Evento / Conferencia' },
  { value: 'cold_outreach',        label: 'Prospección directa (cold)' },
  { value: 'inbound_web',          label: 'Web / Inbound' },
  { value: 'otro',                 label: 'Otro' },
] as const

// Al crear un cliente con lead_source que empiece con 'aliado_',
// mostrar campo adicional: referral_name (nombre del aliado que refirió)
// y calcular automáticamente la comisión al cerrar el proyecto
```

---

## D. Métricas del Programa de Alianzas (para /app/analytics)

```typescript
// KPIs del programa de alianzas que deben aparecer en el dashboard
export const ALLIANCE_METRICS = [
  'total_aliados_activos',          // aliados que han referido al menos 1 cliente
  'clientes_referidos_total',       // total de clientes que llegaron vía aliado
  'revenue_generado_por_aliados',   // ingresos totales de proyectos referidos
  'comisiones_pagadas_total',       // total pagado a aliados
  'tasa_conversion_referidos',      // % de referidos que se convierten en clientes
  'aliado_top_por_revenue',         // el aliado que más revenue ha generado
  'tiempo_cierre_referidos_vs_directo', // referidos cierran más rápido que cold
] as const
```

---

## E. Materiales de Presentación para Aliados

Cuando un aliado pregunte "¿cómo funciona exactamente?", estos son los puntos clave:

1. **No es competencia.** SAP hace estrategia — no contabilidad, no derecho, no fiscal.
2. **El cliente siempre es del aliado.** SAP no vende retainers de contabilidad ni servicios legales.
3. **El proceso es invisible para el aliado.** El aliado refiere, SAP atiende, el aliado cobra.
4. **Mínimo de fricción.** Una llamada de presentación de 20 minutos es todo lo que necesita el aliado.
5. **El aliado puede ver el estado de sus referidos.** En V2, portal de comisionistas en PETER.
