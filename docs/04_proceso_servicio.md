# PETER — Proceso de Servicio Strategic AI Partners
<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR:
  Este archivo define el proceso completo de servicio de SAP de inicio a fin.
  Úsalo para:
  - Mapear los estados del proyecto (tabla `projects.status`) a las fases del proceso
  - Generar los mensajes de estado en la UI (/app/projects/:id)
  - Construir el wizard de nuevo proyecto con las fases correctas
  - Diseñar el flujo de notificaciones automáticas por fase
  - Escribir los textos de onboarding para nuevos consultores
  - Generar el contenido de propuestas comerciales con el motor de IA
-->

## Propuesta de Valor — Los 3 Mensajes que Cierran la Venta

### Para el Director General
> "En 48 horas identificamos dónde tu empresa deja dinero sobre la mesa —
> con la metodología de Bain, ejecutada por IA, a una fracción del costo.
> Y te damos acceso a ese mismo nivel de análisis todos los meses."

### Para el CFO / Director Financiero
> "Cada diagnóstico incluye un ROI Calculator. Antes de firmarnos,
> te mostramos exactamente cuántos pesos identificaremos en ineficiencias.
> Si no identificamos al menos 10x el costo del servicio, te regresamos tu dinero."

### Para el Dueño de Empresa Familiar
> "En 3 semanas tienes un diagnóstico que ningún consultor te había dado antes:
> completo, con datos duros, con recomendaciones concretas, sin jerga innecesaria.
> Y si quieres que sigamos contigo, el retainer mensual es lo que pagas en un
> fin de semana de golf."

---

## Proceso Completo — 8 Fases

### Fase 0 — Calificación del Prospecto
**Estado en DB:** N/A (aún no hay proyecto) | **Duración:** 1 sesión de 30 min

**Objetivo:** Verificar que vale la pena invertir tiempo en este prospecto.

**Actividades:**
- Reunión de 30 minutos con el tomador de decisiones
- Aplicar filtro BANT: Budget, Authority, Need, Timeline
- Hacer las 5 preguntas bloqueantes del documento de preguntas para el socio

**Criterio de avance:** El prospecto tiene presupuesto disponible, puede tomar la decisión
sin necesidad de 3 comités, tiene un problema real urgente y puede decidir en 30 días.

**Entregable:** Propuesta comercial personalizada con ROI Calculator

**Si NO avanza:** Registrar en PETER como cliente `status: prospect` con notas de por qué
no avanzó. El CRM guarda el historial para retomar en 3–6 meses.

---

### Fase 1 — Kickoff y Diagnóstico Inicial
**Estado en DB:** `in_progress` | **Duración:** Semana 1, Día 1–2

**Objetivo:** Obtener el contexto completo del cliente y sus documentos clave.

**Actividades:**
- Firma del contrato (incluye NDA, alcance, precio, forma de pago)
- Entrevista de 2 horas con el Director General (grabada con Jamie)
- Solicitud formal de documentos: estados financieros últimos 2 años, org chart,
  reportes internos, presentaciones de resultados

**Entregable:** Guía de recolección de datos completada + documentos en Supabase Storage

**Nota para el desarrollador:** Al crear un proyecto con `status: in_progress`,
generar automáticamente un checklist de documentos requeridos según la industria
del cliente y las áreas seleccionadas para analizar.

---

### Fase 2 — Fieldwork — Visitas por Área
**Estado en DB:** `in_progress` | **Duración:** Semanas 1–2

**Objetivo:** Obtener información de primera mano de cada área del negocio.

**Actividades:**
- El asociado visita cada área seleccionada: 2–3 horas por área
- Graba con Jamie.ai, aplica guión MECE de preguntas
- Sube transcripciones a PETER mismo día
- PETER genera pre-diagnóstico automático de cada sesión

**Áreas estándar por diagnóstico:**
1. Reunión con Director General (estrategia y contexto)
2. Director/Gerente de Finanzas (números reales)
3. Director/Gerente de Operaciones (procesos y capacidad)
4. Director/Gerente de Ventas (revenue y clientes)
5. Director/Gerente de RH (talento y organización) — si aplica
6. Gerente de TI / Sistemas — si aplica

**Entregable:** 4–6 transcripciones subidas + pre-diagnóstico por área

---

### Fase 3 — Procesamiento con IA
**Estado en DB:** `processing` | **Duración:** 48–72 horas

**Objetivo:** Convertir documentos y transcripciones en hallazgos estructurados.

**Pipeline de IA:**
1. **Gemini 1.5 Pro** — Extracción e indexación de datos de documentos financieros
2. **Claude Sonnet** — Aplicación del framework seleccionado, construcción del árbol MECE
3. **GPT-4o** — Validación cruzada de hallazgos (si diverge de Claude, se marca para revisión)
4. **Claude Sonnet** — Redacción ejecutiva de hallazgos y recomendaciones
5. **Motor de cálculo** — Estimación de impacto económico por hallazgo (en MXN)

**Nota para el desarrollador:** La pantalla `ProcessingScreen.tsx` muestra este pipeline
en tiempo real. El estado del proyecto cambia a `review` cuando termina automáticamente.

---

### Fase 4 — Revisión QC del Socio
**Estado en DB:** `review` | **Duración:** 4–8 horas del socio

**Objetivo:** El socio valida que cada hallazgo tiene "calidad Bain" antes de entregarlo.

**Actividades:**
- Revisar 100% de los hallazgos generados
- Editar, validar o rechazar cada uno
- Agregar el "So What?" estratégico donde la IA no lo capturó correctamente
- Verificar que el impacto económico es razonable y defenible ante el cliente
- Si hay hallazgos rechazados: regenerar con instrucciones adicionales

**Estándar de calidad "Bain-grade":**
- Hallazgo específico (no genérico — aplica a ESTA empresa, no a cualquier empresa)
- Evidencia citada (de documentos o transcripciones específicas)
- So What? claro (qué pasa si no hacen nada al respecto)
- Impacto cuantificado (en MXN, no solo "significativo")
- Recomendación accionable (quién, qué, en cuánto tiempo)

**Regla crítica:** Ningún reporte sale sin la validación del socio. Sin excepción.

---

### Fase 5 — Presentación Ejecutiva
**Estado en DB:** `review` → `delivered` | **Duración:** 1 sesión de 90 min

**Objetivo:** Presentar hallazgos al Comité Directivo con impacto.

**Formato estándar:**
- 45 min de presentación de hallazgos (máx. 12 diapositivas)
- 30 min de preguntas y discusión
- 15 min de propuesta de siguiente paso (Retainer)

**Reglas de oro para la presentación:**
- Empezar con el hallazgo más crítico, no con el más fácil
- Cada hallazgo tiene su número en MXN — el costo de no actuar
- Nunca leer las diapositivas — el deck es para el cliente, no para el consultor
- El socio presenta, el asociado toma notas de las reacciones

**Entregable:** PDF del reporte + deck ejecutivo de 10–12 slides

---

### Fase 6 — Propuesta de Retainer
**Estado en DB:** `delivered` | **Duración:** 48–72 horas post-presentación

**Objetivo:** Convertir el diagnóstico en un retainer mensual.

**Timing crítico:** La propuesta se presenta exactamente 48 horas después de la
presentación ejecutiva — cuando el cliente aún tiene frescas las urgencias del diagnóstico.

**Estructura de la propuesta:**
1. Resumen de los 3 hallazgos más críticos identificados
2. Qué pasa si no actúan en cada uno (costo de inacción)
3. Lo que el Retainer incluye: 2 sesiones/mes + acceso a plataforma + 1 reporte mensual
4. El precio: $15K–$25K MXN/mes
5. Condición de entrada: contrato mínimo de 3 meses

**Argumento de cierre:** "El diagnóstico identificó $X MXN en oportunidades de mejora.
El retainer cuesta $Y MXN al mes. En el primer mes ya tienen el ROI cubierto."

---

### Fase 7 — Ejecución del Retainer
**Estado en DB:** Retainer `active` | **Duración:** Mensual, indefinido

**Objetivo:** Acompañar la implementación y mantener la relación a largo plazo.

**Entregables mensuales:**
- 2 sesiones de trabajo (1 estratégica con DG + 1 operativa con equipo)
- Reporte mensual: 3 hallazgos del mes + estado de iniciativas + KPIs vs. meta
- Acceso continuo al Chat IA de PETER para consultas entre sesiones
- Actualización de KPIs en la plataforma

**Qué NO incluye el retainer estándar:**
- Implementación técnica de sistemas
- Gestión de proyectos operativos
- Presencia física más de 4 días/mes

---

## Diferenciadores vs. Competencia

| Dimensión | SAP / PETER | Boutique Local Sin IA | Big Four |
|-----------|-------------|----------------------|----------|
| Velocidad | Diagnóstico en 48–72 horas | 2–4 semanas | 2–3 meses |
| Precio | $70K–$120K MXN | $120K–$500K MXN | $500K–$5M MXN |
| Calidad del análisis | Metodología Bain + validación Partner | Inconsistente, depende del consultor | Alta pero enfocada en compliance |
| Fieldwork con IA | Grabación + análisis en tiempo real | Solo notas manuales | Solo entrevistas formales |
| Validación cruzada | 2 modelos de IA en paralelo | Ninguna | Revisión por equipo (lenta) |
| Entregable | 5 hallazgos + 3 palancas + ROI cuantificado | Variable | 100+ páginas que nadie lee |
| Retainer | Con plataforma + KPI monitor | Solo acceso al consultor | Retainer caro sin herramientas |
| Aprendizaje | Cada proyecto alimenta el motor | El conocimiento se va con el consultor | Silos por práctica |

---

## Mapeo de Estados en PETER

```typescript
// Estados del proyecto y su significado operativo
export const PROJECT_STATUS_CONFIG = {
  draft: {
    label: 'Borrador',
    description: 'Proyecto creado pero sin iniciar',
    color: 'text-muted',
    phase: 0,
    nextAction: 'Completar configuración e iniciar diagnóstico'
  },
  in_progress: {
    label: 'En Progreso',
    description: 'Fieldwork y recolección de documentos activos',
    color: 'text-accent-blue',
    phase: 2,
    nextAction: 'Completar visitas y subir transcripciones'
  },
  processing: {
    label: 'Procesando',
    description: 'Motor de IA analizando documentos y transcripciones',
    color: 'text-accent-gold',
    phase: 3,
    nextAction: 'Esperar resultados del motor de IA (48–72h)'
  },
  review: {
    label: 'En Revisión QC',
    description: 'Hallazgos listos para validación del socio',
    color: 'text-warning',
    phase: 4,
    nextAction: 'Validar hallazgos y aprobar reporte'
  },
  delivered: {
    label: 'Entregado',
    description: 'Reporte presentado al cliente',
    color: 'text-success',
    phase: 5,
    nextAction: 'Enviar propuesta de retainer (48h post-presentación)'
  },
  closed: {
    label: 'Cerrado',
    description: 'Proyecto finalizado — puede haber derivado en retainer',
    color: 'text-muted',
    phase: 7,
    nextAction: null
  }
} as const
```
