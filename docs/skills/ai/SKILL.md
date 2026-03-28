# SKILL: Integración de IA y Prompts

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
Antes de: crear un nuevo prompt, integrar un nuevo modelo,
manejar streaming de respuestas, o calcular costos de IA.

## Modelos y sus Casos de Uso

| Modelo | Usar para | Costo aprox. |
|--------|-----------|-------------|
| claude-sonnet-4-20250514 | Análisis principal, redacción ejecutiva, chat | $3/$15 por MTok |
| gpt-4o | Validación cruzada de hallazgos | $5/$15 por MTok |
| gemini-1.5-pro | Extracción de datos de documentos largos | $1.25/$5 por MTok |

## Reglas para Prompts

### Estructura obligatoria de todo prompt
```typescript
// lib/ai/prompts/ejemplo.ts
export const EJEMPLO_SYSTEM = `
Eres [rol específico con experiencia concreta].
Tu objetivo en esta tarea es [objetivo específico].

REGLAS INQUEBRANTABLES:
1. [regla 1]
2. [regla 2]

FORMATO DE RESPUESTA: [JSON/Markdown/texto libre]
IDIOMA: Español
`

export const buildEjemploPrompt = (context: EjemploContext): string => `
[contenido dinámico construido con los datos del contexto]
`
```

### Manejo de streaming (para el chat)
```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2000,
  messages: [{ role: 'user', content: prompt }]
})

// En la API route — retornar como ReadableStream
return new Response(stream.toReadableStream())
```

### Calcular y registrar costo SIEMPRE
```typescript
const cost = (usage.input_tokens * 0.000003) + (usage.output_tokens * 0.000015)
await trackAIUsage({ tenant_id, project_id, model, ...usage, cost_usd: cost, operation })
```

### Manejo de errores de IA
```typescript
try {
  const response = await claude.messages.create({...})
  return response
} catch (error) {
  if (error.status === 529) {
    // Overloaded — retry con backoff
    await sleep(2000)
    return retry()
  }
  if (error.status === 401) throw new Error('API key inválida')
  throw new Error('Error del motor de IA — intenta de nuevo')
}
```

### Verificar modo SAP-Managed vs BYOK
```typescript
const apiKey = tenant.api_mode === 'byok'
  ? await getDecryptedKey(tenant.id, 'claude')
  : process.env.ANTHROPIC_API_KEY!
```

## Costos de Referencia por Operación

| Operación | Tokens aprox. | Costo estimado |
|-----------|--------------|----------------|
| Diagnóstico completo (Claude) | 15,000–25,000 | $0.30–$0.60 USD |
| Validación GPT-4o | 5,000–8,000 | $0.10–$0.20 USD |
| Chat mensaje simple | 1,000–3,000 | $0.02–$0.05 USD |
| Resumen de documento | 3,000–6,000 | $0.06–$0.12 USD |
| **Diagnóstico completo total** | **~35,000** | **~$0.50–$0.90 USD** |
