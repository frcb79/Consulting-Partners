# SKILL: Integración de IA y Prompts

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
