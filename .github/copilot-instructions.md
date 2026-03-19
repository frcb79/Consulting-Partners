# Copilot Instructions — Consulting Partners

## Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4
- **Backend/DB:** Supabase (PostgreSQL + PLpgSQL + RLS)
- **Auth:** Supabase SSR (email/password + magic link)
- **AI:** Vercel AI SDK con Claude (Anthropic) y GPT-4o (OpenAI)
- **PDF:** pdf-lib + pdf-parse
- **Validación:** Zod

## Convenciones de código
- Usar TypeScript estricto. **Nunca usar `any`** — usar tipos explícitos o `unknown`.
- Componentes **Server Components** por defecto en Next.js App Router. Solo usar "use client" cuando sea estrictamente necesario.
- Componentes funcionales con hooks. Sin componentes de clase.
- Nombres de funciones y variables en **camelCase**.
- Nombres de componentes en **PascalCase**.
- Nombres de tablas SQL en **snake_case**.
- Importar tipos con `import type { ... }`.

## Estructura del proyecto (App Router)
- `src/app/` — rutas y páginas (App Router)
- `src/app/app/` — área privada de la aplicación (requiere auth)
- `src/app/api/` — API routes (Next.js Route Handlers)
- `src/components/` — componentes reutilizables
- `src/lib/supabase/` — cliente Supabase (browser, server, middleware)
- `src/lib/auth/` — utilidades de autenticación
- `docs/` — documentación del proyecto

## Patrones preferidos
- Usar `createClient()` de `@/lib/supabase/server` en Server Components y Route Handlers.
- Usar `createClient()` de `@/lib/supabase/client` en Client Components.
- **Nunca** usar el cliente de browser en Server Components.
- Manejo de errores de Supabase siempre verificando el campo `error` del response.
- Row Level Security (RLS) activo en **todas** las tablas. Multi-tenant por `tenant_id`.
- Variables de entorno para todas las API keys (nunca hardcodear).
- Preferir async/await sobre `.then()/.catch()`.
- Validar inputs con **Zod** en Route Handlers.

## Multi-tenancy
- Todas las tablas de negocio tienen `tenant_id` (UUID).
- Las políticas RLS filtran siempre por `tenant_id` del usuario autenticado.
- Nunca hacer queries sin filtrar por el tenant del usuario actual.
- Probar aislamiento entre tenants antes de cada release.

## Integraciones de IA
- Usar el Vercel AI SDK (`ai` package) para streaming de respuestas.
- Claude para diagnósticos y análisis de documentos.
- GPT-4o para chat consultor.
- Siempre manejar errores de las APIs de IA (rate limits, timeouts).

## Base de datos (Supabase)
- Migraciones SQL en `docs/` con nombre descriptivo y fecha.
- Funciones y triggers en PLpgSQL.
- Índices en todas las foreign keys.
- `search_path` fijo en funciones para evitar inyección.
- Ejecutar Security Advisor después de cada migración DDL.

## Roles del sistema
- `super_admin` — Administrador SAP (acceso total)
- `consultant` — Consultor (acceso a sus clientes y diagnósticos)
- `client` — Cliente final (portal solo lectura)
- El middleware protege `/app` requiriendo sesión activa.

## Seguridad
- Activar RLS en todas las tablas nuevas.
- Revisar políticas `anon` para evitar permisos accidentales.
- SMTP propio en producción para recovery/confirmación.
- No exponer `service_role` key en el frontend.
- Validar passwords con mínimo 10 caracteres (mayúscula, minúscula, número, símbolo).

## Testing
- Seguir `docs/TESTING_GUIDE.md` para flujos de prueba.
- Probar los 3 roles (super_admin, consultant, client) en cada release.
- Verificar aislamiento entre tenants con 2 usuarios distintos.