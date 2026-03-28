# SKILL: DevOps, CI/CD y Deploy

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
Antes de: hacer deploy a producción, configurar variables de entorno,
crear un nuevo ambiente, o configurar GitHub Actions.

## Flujo de Deploy

```
desarrollo local → feature branch → PR → main → Vercel auto-deploy
```

## Ambientes

| Ambiente | Branch | URL | Base de datos |
|---------|--------|-----|---------------|
| Local | cualquiera | localhost:3000 | Supabase local o dev |
| Preview | feature/* | [hash].vercel.app | Supabase dev |
| Producción | main | peter.tudominio.com | Supabase prod |

## Variables de Entorno por Ambiente

Configurar en: Vercel Dashboard > Settings > Environment Variables

```bash
# Requeridas en todos los ambientes
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
ENCRYPTION_SECRET
RESEND_API_KEY
NEXT_PUBLIC_APP_URL

# Solo producción
SENTRY_DSN
NEXT_PUBLIC_POSTHOG_KEY
```

## GitHub Actions — CI básico

Crear `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Checklist de Deploy a Producción
- [ ] `npm run build` pasa sin errores localmente
- [ ] Variables de entorno actualizadas en Vercel
- [ ] Migraciones de DB ejecutadas en Supabase prod
- [ ] Tests pasan
- [ ] ERROR_LOG revisado — ningún bug conocido sin resolver
- [ ] PROJECT_BRAIN.md actualizado
