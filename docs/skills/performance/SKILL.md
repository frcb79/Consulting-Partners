# SKILL: Performance y Optimización

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
