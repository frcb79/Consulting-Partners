# SKILL: Accesibilidad (a11y)

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
