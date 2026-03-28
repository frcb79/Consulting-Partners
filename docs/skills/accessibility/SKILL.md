# SKILL: Accesibilidad (a11y)

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
Antes de: publicar cualquier componente interactivo,
crear formularios, o hacer deploy a producción.

## Estándar: WCAG 2.1 Nivel AA

## Reglas Básicas Obligatorias

### Contraste de colores
El tema oscuro de PETER tiene buen contraste base, pero verificar siempre:
- Texto sobre bg-surface (#0D1421): texto-primary (#F1F5F9) → ratio 14:1 ✅
- Texto secundario sobre bg-base: texto-secondary (#94A3B8) → verificar con herramienta
- Herramienta: webaim.org/resources/contrastchecker

### Semántica HTML
```tsx
// ❌ Mal
div onClick={handleSubmit}>Enviar</div>

// ✅ Bien  
<button onClick={handleSubmit} type="submit">Enviar</button>

// ❌ Mal
div className="text-xl font-bold">Título</div>

// ✅ Bien
<h2 className="text-xl font-bold">Título</h2>
```

### Formularios
```tsx
// Siempre asociar label con input
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" />

// Errores accesibles
<input aria-describedby="email-error" aria-invalid={!!error} />
{error && <p id="email-error" role="alert">{error}</p>}
```

### Navegación por teclado
- Tab: navegar entre elementos interactivos
- Enter/Space: activar botones
- Escape: cerrar modales y dropdowns
- Flechas: navegar en menús y selects

### Imágenes
```tsx
// Imagen informativa
<Image src={logo} alt="Logo de Strategic AI Partners" />

// Imagen decorativa
<Image src={background} alt="" aria-hidden="true" />
```
