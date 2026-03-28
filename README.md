# Consulting Partners

Plataforma SaaS de consultoria con IA.

## Estado actual

El proyecto ya esta inicializado con:

- Next.js App Router + TypeScript + Tailwind
- Supabase SSR (cliente browser + server)
- Login con email/password
- Login con magic link
- Callback de autenticacion
- Middleware de proteccion para rutas privadas

## Variables de entorno

Usa este archivo como base:

- [.env.example](.env.example)

Variables requeridas:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY como compatibilidad)

## Ejecucion local

1. Instalar dependencias:

	npm install

2. Crear archivo de entorno:

	cp .env.example .env.local

3. Completar variables en .env.local

4. Levantar proyecto:

	npm run dev

5. Abrir en navegador:

	http://localhost:3000

## Flujo implementado

1. Entrar a /login
2. Iniciar sesion con password o magic link
3. Supabase crea sesion
4. Middleware protege /app
5. Si hay sesion activa, redirige a /app

## Seguridad (estado actual)

Hardening ya aplicado en base de datos:

- RLS activo en tablas multi-tenant clave.
- Politicas RLS ajustadas para mejor rendimiento con `select auth.uid()`.
- Indices para foreign keys en `clients` y `profiles`.
- `search_path` fijado en la funcion `set_updated_at`.

Pendiente de activar en Supabase Auth:

- Leaked Password Protection (HaveIBeenPwned).

Ruta en dashboard:

1. Supabase Dashboard -> Authentication -> Providers -> Email.
2. Activar "Leaked password protection".
3. Definir politica de password fuerte (minimo 10+, con mayuscula, minuscula, numero y simbolo).

Referencia oficial:

- https://supabase.com/docs/guides/auth/password-security

## Checklist de produccion (auth + datos)

1. Confirmar que todas las tablas de negocio nuevas salen con RLS habilitado por default.
2. Revisar policies de `anon` para evitar permisos accidentales de lectura global.
3. Activar leaked password protection y requisitos de password robustos.
4. Configurar SMTP propio para recovery/confirmacion en produccion.
5. Ejecutar Security Advisor despues de cada migracion DDL.
6. Probar aislamiento entre dos usuarios de distintos tenants antes de cada release.

## Archivos clave

- [middleware.ts](middleware.ts)
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts)
- [src/lib/supabase/middleware.ts](src/lib/supabase/middleware.ts)
- [src/app/login/page.tsx](src/app/login/page.tsx)
- [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts)
- [src/app/app/page.tsx](src/app/app/page.tsx)
