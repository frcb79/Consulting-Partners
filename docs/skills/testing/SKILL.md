# SKILL: Testing y Verificación

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
Antes de: crear una nueva feature crítica, refactorizar código existente,
o preparar un deploy a producción.

## Stack de Testing en PETER

```
Unit Tests:        Vitest (más rápido que Jest con Vite/Next)
Component Tests:   React Testing Library + Vitest
E2E Tests:         Playwright (para flujos críticos)
API Tests:         Vitest + fetch mock
```

## Qué SIEMPRE debe tener test

### Crítico (0% tolerancia de bugs)
- Motor de diagnóstico: input → output del análisis IA
- Cálculo de costos y facturación
- RLS: verificar que un tenant no puede ver datos de otro
- Magic links de invitación de cliente
- Encriptación/desencriptación de API keys

### Importante (test antes de deploy)
- Formulario de alta de cliente (validaciones)
- Upload de documentos (tipos y tamaños)
- Chat con streaming (manejo de errores de conexión)
- Exportación de PDF

## Patrones de Test

### Unit test básico (Vitest)
```typescript
import { describe, it, expect } from 'vitest'
import { calculateLeadScore } from '@/lib/crm/scoring'

describe('calculateLeadScore', () => {
  it('da puntuación máxima a CEO de empresa grande referido', () => {
    const lead = { cargo: 'CEO', tamano: 'grande', canal: 'referido', urgencia: 'alta' }
    expect(calculateLeadScore(lead)).toBe(100)
  })
  it('da puntuación baja a coordinador de microempresa cold', () => {
    const lead = { cargo: 'coordinador', tamano: 'micro', canal: 'cold', urgencia: 'ninguna' }
    expect(calculateLeadScore(lead)).toBeLessThan(30)
  })
})
```

### Test de RLS (crítico)
```typescript
it('tenant A no puede ver clientes de tenant B', async () => {
  const clientA = supabaseAs(userTenantA)
  const { data } = await clientA.from('clients').select('*')
  const idsDelTenantB = data?.map(c => c.tenant_id).filter(id => id === tenantBId)
  expect(idsDelTenantB).toHaveLength(0)
})
```

## Checklist de Verificación Manual (antes de demo)

- [ ] Login funciona con email y magic link
- [ ] Un usuario no puede ver datos de otro tenant
- [ ] Subir PDF y obtener resumen IA funciona
- [ ] El diagnóstico completo corre de inicio a fin sin errores
- [ ] La exportación de PDF se descarga correctamente
- [ ] El portal del cliente funciona con magic link en incógnito
- [ ] La app es usable en pantalla de 375px (iPhone SE)
- [ ] No hay `console.error` en la consola del browser
