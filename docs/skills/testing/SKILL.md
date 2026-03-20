# SKILL: Testing y Verificación

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
