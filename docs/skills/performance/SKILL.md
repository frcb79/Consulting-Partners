# SKILL: Performance y Optimización

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
Antes de: agregar una nueva dependencia pesada, implementar una lista larga,
subir imágenes, o cuando algo se siente lento.

## Métricas Objetivo

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID / INP | < 100ms | Chrome DevTools |
| CLS | < 0.1 | Lighthouse |
| Bundle size (JS inicial) | < 200KB | `npm run build` |
| Tiempo de build | < 60s | Vercel |

## Reglas de Performance

### Imágenes
- SIEMPRE usar `next/image` — nunca `<img>` directo
- Definir width y height siempre
- Usar `priority` solo en la imagen más importante (LCP)
- Formatos: WebP para fotos, SVG para íconos

### Carga de datos
- Preferir Server Components para datos que no cambian frecuentemente
- Usar `loading.tsx` para Suspense automático en Next.js
- Para listas largas (>50 items): implementar paginación o virtualización
- Cachear resultados de APIs de IA que no cambien (React cache())

### Dependencias
- Antes de `npm install [paquete]`, verificar su tamaño en bundlephobia.com
- Preferir imports específicos: `import { format } from 'date-fns'` (no `import * as dateFns`)
- Lazy load componentes pesados: `const HeavyComponent = dynamic(() => import(...))`

### Base de datos
- EXPLAIN ANALYZE en queries que tarden más de 100ms
- Siempre filtrar por tenant_id primero (usa el índice)
- Limitar resultados: `.limit(50)` en listas paginadas
- Seleccionar solo columnas necesarias: `.select('id, name, status')` no `.select('*')`
