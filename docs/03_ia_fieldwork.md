# PETER — Herramientas de IA para Fieldwork y Entrevistas
<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo define el stack de IA que usan los asociados durante visitas a clientes.
  Úsalo para:
  - Construir la integración de transcripciones en /app/documents (importar desde Fireflies/Otter)
  - Diseñar el flujo post-visita en el motor de diagnóstico (transcripción → análisis)
  - Generar el prompt de análisis de transcripciones en lib/ai/prompts/transcript.ts
  - Documentar el onboarding del consultor sobre qué herramientas instalar antes de una visita
-->

## Contexto
El asociado que visita la empresa no solo hace preguntas — la IA escucha, transcribe,
analiza y profundiza en tiempo real. Este es el diferenciador operativo más importante
de SAP: ninguna boutique local en México hace esto de forma sistemática.

El flujo es: **Visita → Grabación → Transcripción → PETER analiza → Pre-diagnóstico en 24h**

---

## A. Herramientas de Grabación y Transcripción

| Herramienta | Mejor Para | Precio/mes | Precisión | Calificación SAP | Instalar |
|-------------|-----------|------------|-----------|-----------------|---------|
| **Jamie.ai** | Reuniones presenciales — graba sin bot visible, desde el audio del dispositivo | $15–$25/usuario | 94% | ⭐ PRINCIPAL para visitas presenciales | jamie.app |
| **Fireflies.ai** | Reuniones virtuales — bot que entra a Zoom/Teams/Meet, integración CRM, 100 idiomas | $10–$19/usuario | 93% | ⭐ PRINCIPAL para reuniones virtuales | fireflies.ai |
| **Otter.ai** | Transcripción en tiempo real + AI Chat post-reunión: "¿qué dijo X sobre Y?" | $8–$30/usuario | 91% | ✅ Complemento para talleres largos | otter.ai |
| **Fathom** | Gratis con Zoom. Resumen en tiempo real. Solo Zoom. | GRATIS | 89% | ✅ Para reuniones Zoom internas | fathomhq.com |
| **Avoma** | Notas estructuradas + coaching + integración CRM | $19–$49/usuario | 92% | 🟡 Evaluar en Mes 6+ | avoma.com |
| **Gong.io** | Inteligencia de revenue y coaching de ventas — muy completo pero caro | $1,600/usuario/año | 95% | ⛔ Demasiado caro para inicio | gong.io |

### Decisión para V1:
- **Visitas presenciales (90% de los casos):** Jamie.ai
- **Reuniones virtuales / seguimiento remoto:** Fireflies.ai
- **Costo total:** ~$35–$44 USD/mes para 1 asociado

---

## B. Stack Completo del Asociado en Visita de Campo

El asociado llega con este setup listo antes de entrar al cliente:

```
ANTES DE SALIR DE LA OFICINA:
  ☐ Jamie.ai abierto en laptop/teléfono — listo para grabar
  ☐ Guión de preguntas cargado (PDF impreso + en tablet)
  ☐ Expediente del cliente revisado en PETER (/app/clients/:id)
  ☐ Últimos documentos del cliente revisados
  ☐ Batería completa, cable de carga en mochila

EN LA VISITA:
  ☐ Abrir Jamie.ai y activar grabación ANTES de entrar a la sala
  ☐ No mencionar la grabación si el cliente no lo pregunta (es para notas internas)
  ☐ Si el cliente pregunta: "Es para tomar mejores notas y darte un mejor reporte"
  ☐ Claude en tablet para profundizar en respuestas en tiempo real (ver sección C)
  ☐ Notion / OneNote para observaciones no verbales: cultura, espacio, lenguaje corporal

AL TERMINAR:
  ☐ Exportar transcripción de Jamie como .txt o .pdf
  ☐ Subir a PETER: /app/documents → cliente → proyecto actual
  ☐ Marcar como tipo: `transcript`
```

---

## C. Cómo Usar Claude en Tiempo Real Durante la Visita

Cuando el cliente responde una pregunta, el asociado puede abrir Claude en su tablet
y profundizar inmediatamente:

**Prompt de profundización en tiempo real:**
```
El cliente acaba de decir: "[respuesta literal del cliente]"

Contexto: empresa de [industria], [tamaño], reto principal es [reto].

Dame 3 preguntas de seguimiento específicas para profundizar en lo que acaba de decir,
ordenadas de más a menos importantes. Formato: solo las preguntas, sin explicación.
```

**Resultado:** el asociado hace preguntas más inteligentes que cualquier consultor
que dependa solo de su memoria o de un guión fijo. El cliente percibe un nivel de
escucha y profundidad que no había visto antes.

---

## D. Flujo Post-Visita — De Grabación a Pre-Diagnóstico

```
Paso 1 — Exportar (mismo día, máx. 2 horas después de la visita)
  → Descargar transcripción de Jamie/Fireflies como texto
  → Subir a PETER como documento tipo `transcript` del cliente

Paso 2 — Análisis automático con IA (automático al subir)
  → PETER detecta que es una transcripción
  → Claude aplica el siguiente prompt:

    "Eres un Socio Senior de Bain analizando la transcripción de una visita
     a [empresa]. Identifica:
     1. Los 5 problemas principales mencionados explícita o implícitamente
     2. Cuellos de botella operativos detectados
     3. Oportunidades de automatización o mejora de proceso
     4. Gaps de liderazgo o cultura organizacional
     5. Contradicciones o temas que el cliente evitó responder
     6. Las 5 preguntas sin respuesta que debemos profundizar en la próxima sesión
     
     Formato de salida: JSON estructurado con las 6 secciones anteriores."

Paso 3 — Pre-Diagnóstico de 1 página (generado automáticamente)
  → PETER genera un resumen ejecutivo de la visita
  → El socio lo revisa y valida en 30 minutos
  → Se convierte en el primer entregable de valor para el cliente

Paso 4 — Guión para siguiente sesión (generado automáticamente)
  → Basado en los gaps identificados, PETER genera el guión de preguntas
    para la siguiente visita, ordenado por área y prioridad
```

**Impacto en el negocio:** una visita de 2 horas genera un pre-diagnóstico
en menos de 24 horas. Tiempo total del consultor para validarlo: 30 minutos.
Ninguna boutique local hace esto.

---

## E. Guión Base de Preguntas por Área

Estas preguntas se cargan automáticamente en el wizard de nuevo diagnóstico
según las áreas seleccionadas. El asociado las lleva impresas a cada visita.

### Finanzas y Rentabilidad
- ¿Cuál es su margen EBITDA actual vs. el del año pasado?
- ¿Dónde siente que deja más dinero sobre la mesa?
- ¿Cuál es su mayor línea de costo que siente que está fuera de control?
- ¿Cómo está su ciclo de conversión de efectivo (CxC, CxP, inventarios)?
- ¿Tiene deuda? ¿A qué tasa y con qué condiciones?

### Operaciones y Procesos
- ¿Cuál es el proceso que más tiempo toma y que menos valor agrega?
- ¿Dónde están sus principales cuellos de botella de producción/servicio?
- ¿Qué tan cerca está operando de su capacidad máxima?
- ¿Qué procesos están documentados y cuáles dependen de personas específicas?
- ¿Qué pasaría si su gerente de operaciones renunciara mañana?

### Ventas y Revenue
- ¿Cuál es su tasa de conversión de prospecto a cliente?
- ¿Cuánto depende de 1-2 clientes grandes? ¿Qué % de sus ventas representan?
- ¿Cuál es su proceso de venta actual? ¿Quién lo hace y cómo?
- ¿Cuánto tiempo toma cerrar una venta desde el primer contacto?
- ¿Por qué pierden clientes? ¿Qué les dicen los que se van?

### Recursos Humanos
- ¿Cuáles son los 3 puestos que si los pierde en los próximos 6 meses, el negocio sufre más?
- ¿Tiene un plan de sucesión para el Director General?
- ¿Cómo mide el desempeño de su equipo directivo actualmente?
- ¿Cuál es la rotación anual de personal clave?
- ¿Qué tan alineado está el equipo con la dirección estratégica?

### Tecnología y Sistemas
- ¿Qué sistemas usa actualmente (ERP, CRM, contabilidad)?
- ¿Cuántos procesos críticos todavía se hacen en Excel?
- ¿Qué tan integrados están sus sistemas entre sí?
- ¿Cuánto tiempo pierde su equipo en tareas repetitivas que podrían automatizarse?
- ¿Ha considerado alguna transformación digital? ¿Por qué no ha avanzado?

---

## F. Integración con PETER (para el desarrollador)

```typescript
// Tipos de transcripción que PETER debe reconocer y procesar automáticamente
export const TRANSCRIPT_INDICATORS = [
  'transcript',      // nombre del archivo contiene "transcript"
  'transcripcion',   // variante en español
  'fireflies',       // exportado desde Fireflies
  'otter',           // exportado desde Otter
  'jamie',           // exportado desde Jamie
  'reunion',         // nombre sugiere que es una reunión grabada
  'visita',          // visita de campo
  'entrevista',      // entrevista de diagnóstico
] as const

// Al subir un documento, si su nombre coincide con alguno de estos,
// marcar automáticamente como tipo='transcript' y disparar el análisis
// con el prompt de análisis de transcripción (ver lib/ai/prompts/transcript.ts)
```
