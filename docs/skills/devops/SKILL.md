# SKILL: DevOps, CI/CD y Deploy

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
