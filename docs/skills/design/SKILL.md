# SKILL: Diseño Visual y Componentes

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
Antes de: crear un nuevo componente visual, diseñar una nueva página,
elegir colores o tipografía, o implementar animaciones.

## Sistema de Diseño PETER

### Identidad Visual
Referencia: Goldman Sachs + Palantir + Stripe — terminal financiero de élite.
Oscuro, preciso, confiable. Nada de gradientes brillantes ni elementos playful.

### Jerarquía de Texto
```
Display XL (3rem / Sora 700):   títulos de página principales
Display LG (2.25rem / Sora 700): títulos de sección
Display MD (1.75rem / Sora 600): subtítulos importantes
Body LG (1.125rem / DM Sans 400): texto principal
Body MD (1rem / DM Sans 400):    texto estándar
Body SM (0.875rem / DM Sans 400): texto secundario, labels
Mono (0.875rem / JetBrains Mono): números, códigos, KPIs
```

### Componentes Base (todos ya en shadcn/ui)
- Botón primario: bg-accent-blue, hover con blue-glow shadow
- Botón secundario: border border-white/10, bg-bg-elevated
- Card: bg-bg-surface, border border-white/6, shadow-card
- Badge: rounded-full, tamaño pequeño, colores semánticos
- Input: bg-bg-elevated, border-white/10, focus border-accent-blue

### Espaciado (usar múltiplos de 4)
- xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px

### Animaciones Permitidas
- Entrada de página: fadeInUp 0.5s ease-out
- Hover en cards: translateY(-2px) + shadow intensificada
- Números/KPIs: counter animado con framer-motion
- Modales: scale 0.95→1 + opacity 0→1
- NO usar animaciones de más de 600ms — se siente lento

### Patrones de Layout
- Dashboard: grid de 4 columnas con cards de KPIs en la parte superior
- Listas: tabla con hover state, filas alternadas muy sutiles
- Formularios: máximo 2 columnas en desktop, 1 en móvil
- Sidebar: 240px colapsada a 60px en móvil
