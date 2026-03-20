# INSTRUCCIÓN PARA COPILOT / CURSOR
# Ejecuta este plan completo en orden. No saltes pasos. Al terminar, confirma cada archivo creado.
# Este script configura un sistema profesional de desarrollo que funciona para PETER y cualquier proyecto futuro.

---

# PLAN DE EJECUCIÓN: Sistema Profesional de Desarrollo
# Objetivo: dejar el proyecto listo para desarrollar como un equipo de élite

Ejecuta los siguientes pasos en orden. Para cada paso, crea el archivo con el contenido exacto indicado.

---

## PASO 1 — Crear la estructura de carpetas

Ejecuta en terminal:

```bash
# Desde la raíz del proyecto
mkdir -p .cursor/rules
mkdir -p .github
mkdir -p docs/skills/architecture
mkdir -p docs/skills/design
mkdir -p docs/skills/devops
mkdir -p docs/skills/security
mkdir -p docs/skills/testing
mkdir -p docs/skills/ux
mkdir -p docs/skills/legal
mkdir -p docs/skills/operations
mkdir -p docs/skills/performance
mkdir -p docs/skills/accessibility
mkdir -p docs/skills/data
mkdir -p docs/skills/ai
mkdir -p docs/project
mkdir -p docs/business
touch docs/project/PROJECT_BRAIN.md
touch docs/project/ERROR_LOG.md
touch docs/project/DECISIONS.md
touch docs/project/CHANGELOG.md
touch .cursor/rules/main.mdc
touch .github/copilot-instructions.md
echo "✅ Estructura creada"
```

---

## PASO 2 — Crear .github/copilot-instructions.md
## Este es el archivo más importante — Copilot lo lee automáticamente en CADA conversación

Crea `.github/copilot-instructions.md` con este contenido exacto:

```markdown
# PETER — Instrucciones para GitHub Copilot
# Este archivo se carga automáticamente en cada sesión de Copilot en este proyecto.

## Quién eres cuando trabajas en este proyecto

Eres un Senior Full-Stack Engineer con experiencia en:
- Next.js 14 App Router + TypeScript estricto
- Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions)
- Tailwind CSS + shadcn/ui con tema oscuro personalizado
- Integración de APIs de IA (Anthropic Claude, OpenAI, Google Gemini)
- Arquitectura multi-tenant con Row Level Security
- Patrones de diseño: Repository, Service Layer, Factory

Antes de escribir cualquier código, consulta el skill relevante en `docs/skills/`.
Antes de tomar cualquier decisión de arquitectura, consulta `docs/project/DECISIONS.md`.
Antes de implementar algo nuevo, verifica si ya existe en el proyecto.

## El Proyecto

PETER es una plataforma SaaS de consultoría estratégica aumentada con IA.
- Lee `docs/00_indice.md` para contexto completo del negocio
- Lee `docs/project/PROJECT_BRAIN.md` para el estado actual del proyecto
- Lee `docs/project/ERROR_LOG.md` para errores conocidos que NO debes repetir

## Stack Técnico (NO cambiar sin consultar)

```
Framework:    Next.js 14 App Router (NO Pages Router, NO Vite)
Lenguaje:     TypeScript strict mode (NO any, NO as unknown)
Estilos:      Tailwind CSS + shadcn/ui (NO CSS modules, NO styled-components)
Base datos:   Supabase (NO Prisma, NO Drizzle por ahora)
Estado:       Zustand para global, useState/useReducer para local (NO Redux)
Forms:        React Hook Form + Zod (NO Formik)
Fetching:     Supabase client / fetch nativo en Server Components (NO React Query por ahora)
Animaciones:  Framer Motion (NO GSAP)
IA:           @anthropic-ai/sdk, openai, @google/generative-ai
```

## Paleta de Colores (NUNCA hardcodear colores — usar variables)

```css
--bg-base:        #070B14
--bg-surface:     #0D1421
--bg-elevated:    #111E30
--accent-blue:    #1E6FD9
--accent-gold:    #D4A017
--text-primary:   #F1F5F9
--text-secondary: #94A3B8
--text-muted:     #475569
--status-success: #16A34A
--status-warning: #D97706
--status-danger:  #DC2626
```

## Tipografía

```
Display/Headings: Sora (700, 600)
Body/UI:          DM Sans (400, 500)
Números/Código:   JetBrains Mono
```

## Reglas de Código que SIEMPRE debes seguir

### TypeScript
- Nunca usar `any`. Si no sabes el tipo, usa `unknown` y maneja el caso.
- Siempre tipar los props de componentes con interfaces, no type aliases inline.
- Siempre tipar el retorno de funciones async: `Promise<Result | null>`
- Usar enums o `as const` para valores fijos, nunca strings sueltos.

### Componentes React
- Server Components por defecto. Solo `'use client'` cuando sea estrictamente necesario.
- Props siempre con interface nombrada: `interface ButtonProps { ... }`
- Nunca más de 150 líneas por componente. Si crece, extraer sub-componentes.
- Siempre manejar estados: loading, error, empty, y el caso feliz.

### Base de datos (Supabase)
- NUNCA consultar sin filtrar por tenant_id (RLS lo refuerza, pero el código también).
- Siempre usar el cliente correcto: `createClient()` del servidor en Server Components, `createBrowserClient()` en Client Components.
- Siempre manejar el error de Supabase: `const { data, error } = await supabase...`
- NUNCA exponer SUPABASE_SERVICE_ROLE_KEY en el cliente.

### APIs de IA
- Siempre usar try/catch en llamadas a APIs de IA — fallan con frecuencia.
- Siempre registrar el consumo en la tabla `ai_usage` después de cada llamada.
- Siempre verificar el modo (SAP-managed vs BYOK) antes de usar keys.
- Los prompts van en `lib/ai/prompts/` — nunca inline en las API routes.

### Seguridad
- Nunca confiar en datos del cliente — siempre validar con Zod en el servidor.
- Nunca retornar stack traces al cliente — solo mensajes de error amigables.
- Siempre verificar autenticación al inicio de cada API route.
- Variables de entorno sensibles: NUNCA en el código, siempre en .env.local.

### Manejo de errores
- Usar el patrón Result: `{ data: T, error: null } | { data: null, error: string }`
- Siempre mostrar un estado de error visible al usuario, nunca fallar silenciosamente.
- Loggear errores con contexto: qué operación falló, qué datos tenía, cuál fue el error.

## Estructura de Archivos (dónde va cada cosa)

```
app/                    → páginas y layouts (mínima lógica)
app/api/               → API routes (validación + llamada al service)
components/            → componentes reutilizables (NO lógica de negocio)
lib/                   → lógica de negocio, servicios, utilidades
lib/ai/prompts/        → todos los prompts de IA
lib/supabase/          → clientes de Supabase
hooks/                 → custom hooks (prefijo use*)
store/                 → Zustand stores
types/                 → interfaces y tipos compartidos
docs/skills/           → skills por dominio (consultar antes de implementar)
docs/project/          → estado del proyecto, decisiones, errores
docs/business/         → contexto de negocio (NO borrar)
```

## Cuándo consultar cada Skill

| Tarea | Skill a consultar |
|-------|-------------------|
| Diseñar un nuevo componente o página | `docs/skills/design/` + `docs/skills/ux/` |
| Configurar CI/CD, Docker, variables de entorno | `docs/skills/devops/` |
| Agregar autenticación, permisos, encriptación | `docs/skills/security/` |
| Escribir tests unitarios o de integración | `docs/skills/testing/` |
| Optimizar rendimiento o bundle size | `docs/skills/performance/` |
| Diseñar schema de base de datos o migraciones | `docs/skills/architecture/` |
| Implementar formularios o flujos de usuario | `docs/skills/ux/` |
| Hacer accesible un componente (a11y) | `docs/skills/accessibility/` |
| Configurar un modelo de IA o prompt | `docs/skills/ai/` |
| Definir estructura de datos o analytics | `docs/skills/data/` |
| Revisar implicaciones legales o de privacidad | `docs/skills/legal/` |
| Documentar proceso operativo | `docs/skills/operations/` |

## Antes de hacer un PR / commit

- [ ] ¿Corre `npm run build` sin errores?
- [ ] ¿TypeScript sin errores (`npm run type-check`)?
- [ ] ¿Tests pasan (`npm run test`)?
- [ ] ¿Hay algún `console.log` olvidado?
- [ ] ¿Se actualizó `PROJECT_BRAIN.md` si hubo cambio significativo?
- [ ] ¿Se registró en `ERROR_LOG.md` si hubo un bug resuelto?
- [ ] ¿Se actualizó `DECISIONS.md` si se tomó una decisión de arquitectura?
```

---

## PASO 3 — Crear .cursor/rules/main.mdc
## Para usuarios de Cursor — mismo contenido pero en formato MDC

Crea `.cursor/rules/main.mdc` con este contenido:

```
---
description: Reglas principales del proyecto PETER — leer en cada sesión
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: true
---

Eres un Senior Full-Stack Engineer trabajando en PETER, plataforma SaaS de consultoría estratégica.

SIEMPRE antes de escribir código:
1. Lee `docs/project/PROJECT_BRAIN.md` para saber el estado actual
2. Lee `docs/project/ERROR_LOG.md` para no repetir errores conocidos  
3. Consulta el skill relevante en `docs/skills/[dominio]/`

Stack: Next.js 14 + TypeScript strict + Tailwind + shadcn/ui + Supabase + Claude API
Tema: oscuro (#070B14 base, #1E6FD9 azul, #D4A017 gold)
Tipografía: Sora (headings) + DM Sans (body) + JetBrains Mono (números)

NUNCA: any, CSS modules, Pages Router, hardcodear colores, exponer SERVICE_ROLE_KEY
SIEMPRE: tipar todo, manejar errores, verificar tenant_id, registrar uso de IA
```

---

## PASO 4 — Crear docs/project/PROJECT_BRAIN.md
## El cerebro vivo del proyecto — actualizar después de cada sesión de trabajo

Crea `docs/project/PROJECT_BRAIN.md` con este contenido:

```markdown
# PROJECT BRAIN — PETER
> Última actualización: [FECHA] | Actualizar al terminar cada sesión de trabajo

## Estado Actual del Proyecto

**Fase:** Setup inicial  
**Sprint actual:** Semana 1 — Base del proyecto  
**Próxima entrega:** Login + Dashboard + Clientes funcionando en Vercel

## Lo que está DONE ✅
- [ ] Setup de Next.js 14 + TypeScript + Tailwind
- [ ] Supabase conectado y schema ejecutado
- [ ] Estructura de carpetas creada
- [ ] Archivos de contexto (.github/copilot-instructions.md, docs/) creados

## Lo que está EN PROGRESO 🔄
- Nada aún — proyecto recién iniciado

## Lo que está PENDIENTE 📋
- Login funcional (email + magic link)
- Middleware de roles y redirección
- Layout con Sidebar + Header
- Dashboard con datos reales
- Módulo de Clientes (CRUD completo)

## Decisiones Técnicas Importantes
Ver `docs/project/DECISIONS.md` para el historial completo.

**Decisiones activas:**
- Next.js 14 App Router (no Pages Router)
- Supabase como backend completo (no Prisma/Drizzle)
- shadcn/ui con tema oscuro personalizado
- Claude Sonnet como modelo principal de IA

## Contexto de Negocio Rápido
- PETER = plataforma SaaS de consultoría estratégica con IA
- Multi-tenant: cada consultor es un tenant
- 3 roles: super_admin, consultant, client
- 2 mercados: Empresas medianas ($70K–$120K MXN) y MiPYMEs ($3K–$15K MXN)
- Para contexto completo ver `docs/00_indice.md`

## Módulos y su Estado

| Módulo | Estado | Archivos principales |
|--------|--------|---------------------|
| Auth | ⬜ No iniciado | app/(auth)/login/, lib/supabase/ |
| Layout | ⬜ No iniciado | components/layout/ |
| Dashboard | ⬜ No iniciado | app/(app)/dashboard/ |
| Clientes | ⬜ No iniciado | app/(app)/clients/, components/clients/ |
| Diagnóstico | ⬜ No iniciado | app/(app)/projects/, app/api/ai/ |
| Documentos | ⬜ No iniciado | app/(app)/documents/ |
| Chat IA | ⬜ No iniciado | app/(app)/projects/[id]/chat/ |
| Retainers | ⬜ No iniciado | app/(app)/retainers/ |
| Portal Cliente | ⬜ No iniciado | app/(portal)/ |
| Super Admin | ⬜ No iniciado | app/(admin)/ |

**Estados:** ⬜ No iniciado | 🔄 En progreso | ✅ Done | 🐛 Con bugs | 🔒 Bloqueado

## Variables de Entorno Necesarias
Ver `.env.example` para la lista completa.
Estado: ⬜ No configuradas

## Dependencias Externas y su Estado
| Servicio | Estado | Notas |
|---------|--------|-------|
| Supabase | ⬜ No configurado | Crear proyecto en supabase.com |
| Anthropic API | ⬜ No configurado | Obtener key en console.anthropic.com |
| OpenAI API | ⬜ No configurado | |
| Resend | ⬜ No configurado | Para emails |
| Vercel | ⬜ No configurado | Deploy |

## Métricas del Proyecto
- Líneas de código: 0
- Componentes creados: 0
- Tests escritos: 0
- Cobertura: 0%
- Build time: —
- Lighthouse score: —

## Notas de la Última Sesión
_Nada aún — primera sesión_

---
*Actualizar este archivo al terminar cada sesión. Si usas IA para desarrollar, pídele que lo actualice.*
```

---

## PASO 5 — Crear docs/project/ERROR_LOG.md

Crea `docs/project/ERROR_LOG.md`:

```markdown
# ERROR LOG — PETER
> Registro de todos los errores encontrados y cómo se resolvieron.
> LEER ANTES de implementar algo nuevo. Consultar cuando encuentres un error similar.

## Cómo usar este archivo
Cuando encuentres y resuelvas un bug, agrégalo aquí con este formato:

---
**Error:** [descripción corta]  
**Contexto:** [qué estabas haciendo cuando ocurrió]  
**Causa raíz:** [por qué pasó realmente]  
**Síntoma:** [qué veías en pantalla o en la consola]  
**Solución:** [qué hiciste para resolverlo]  
**Cómo evitarlo:** [regla o patrón para no repetirlo]  
**Archivos afectados:** [qué archivos tuviste que cambiar]  
---

## Errores Registrados

_Ningún error registrado aún. Empieza a documentar desde el primer bug._

---

## Errores Comunes en este Stack (pre-cargados)

### E001 — Supabase: "Invalid API key"
**Causa raíz:** Usar SUPABASE_SERVICE_ROLE_KEY en el cliente del browser  
**Solución:** Solo usar service role key en Server Components y API routes  
**Regla:** NEXT_PUBLIC_* solo para anon key. Service role key NUNCA en cliente.

### E002 — Next.js: "useState in Server Component"
**Causa raíz:** Olvidar `'use client'` en componentes que usan hooks  
**Solución:** Agregar `'use client'` al inicio del archivo  
**Regla:** Por defecto todo es Server Component. Agregar 'use client' solo cuando hay interactividad.

### E003 — TypeScript: "Property does not exist on type 'never'"
**Causa raíz:** Supabase retorna `null` cuando no encuentra un registro y no se maneja  
**Solución:** Verificar `if (!data) return` antes de usar el resultado  
**Regla:** Siempre verificar null antes de acceder a propiedades de resultados de Supabase.

### E004 — RLS: El usuario ve datos de otro tenant
**Causa raíz:** Política RLS mal configurada o usando service role key en lugar de anon key  
**Solución:** Revisar las políticas en Supabase Dashboard > Authentication > Policies  
**Regla:** Probar RLS con 2 usuarios de distintos tenants antes de hacer deploy.

### E005 — Claude API: "overloaded_error"
**Causa raíz:** Demasiadas llamadas simultáneas o prompt demasiado largo  
**Solución:** Implementar retry con backoff exponencial (esperar 1s, 2s, 4s...)  
**Regla:** Siempre envolver llamadas a Claude en try/catch con retry logic.

### E006 — Vercel: Build falla por variables de entorno
**Causa raíz:** Variables de entorno no configuradas en Vercel Dashboard  
**Solución:** Settings > Environment Variables en el proyecto de Vercel  
**Regla:** Después de agregar variables a .env.local, agregarlas también en Vercel antes del deploy.

### E007 — Tailwind: Clases no aparecen en producción
**Causa raíz:** Clases generadas dinámicamente no están en el bundle de Tailwind  
**Solución:** Nunca concatenar clases dinámicamente. Usar el patrón: `condition ? 'class-a' : 'class-b'`  
**Regla:** Tailwind necesita ver las clases completas en el código fuente — nunca construirlas con strings.

### E008 — shadcn/ui: Componentes con estilos incorrectos
**Causa raíz:** Agregar componente de shadcn después de modificar globals.css  
**Solución:** Revisar que las variables CSS en globals.css coincidan con lo que shadcn espera  
**Regla:** Revisar globals.css después de cualquier `npx shadcn add [componente]`.
```

---

## PASO 6 — Crear docs/project/DECISIONS.md

Crea `docs/project/DECISIONS.md`:

```markdown
# DECISIONS — PETER
> Registro de decisiones de arquitectura y por qué se tomaron.
> Formato: ADR (Architecture Decision Record) simplificado.
> Consultar ANTES de proponer cambiar algo del stack o la arquitectura.

## Cómo leer este archivo
Cada decisión tiene: contexto (por qué había que decidir), opciones consideradas,
decisión final, y consecuencias. Si quieres cambiar algo, primero entiende por qué
se decidió así originalmente.

---

## ADR-001 — Next.js 14 App Router como framework principal
**Fecha:** Marzo 2026 | **Estado:** Activa

**Contexto:** Necesitábamos un framework que manejara SSR, API routes, y se integrara bien con Vercel.

**Opciones consideradas:**
- Vite + React puro: más simple, pero sin SSR ni API routes nativas
- Next.js Pages Router: más documentación, pero legacy
- Next.js App Router: moderno, Server Components, mejor rendimiento
- Remix: buena opción pero ecosistema más pequeño

**Decisión:** Next.js 14 App Router

**Consecuencias:**
- ✅ Server Components reducen JavaScript en el cliente
- ✅ API Routes eliminan necesidad de servidor separado
- ✅ Deploy a Vercel es trivial
- ⚠️ App Router aún tiene algunos gotchas — documentar en ERROR_LOG cuando aparezcan

---

## ADR-002 — Supabase como backend completo
**Fecha:** Marzo 2026 | **Estado:** Activa

**Contexto:** Necesitábamos DB + Auth + Storage + Realtime sin infraestructura propia.

**Opciones consideradas:**
- PlanetScale + NextAuth + S3: más control, más complejidad
- Firebase: buena opción pero NoSQL complica queries complejas
- Supabase: PostgreSQL + Auth + Storage + RLS en un solo servicio

**Decisión:** Supabase completo

**Consecuencias:**
- ✅ RLS resuelve multi-tenancy a nivel de base de datos
- ✅ PostgreSQL permite queries relacionales complejas
- ✅ Storage para documentos incluido
- ⚠️ Vendor lock-in moderado — mitigado porque Postgres es estándar

---

## ADR-003 — Multi-modelo de IA (Claude + GPT-4o + Gemini)
**Fecha:** Marzo 2026 | **Estado:** Activa

**Contexto:** Un solo modelo de IA es un punto único de falla y puede no ser óptimo para todas las tareas.

**Decisión:** Claude para análisis principal, GPT-4o para validación cruzada, Gemini para extracción.

**Consecuencias:**
- ✅ Mejor calidad por tarea especializada
- ✅ Redundancia si un modelo falla
- ⚠️ 3 APIs que mantener y monitorear
- ⚠️ Costo más alto — mitigado con modo SAP-Managed vs BYOK

---

## ADR-004 — Zustand para estado global (no Redux, no Context)
**Fecha:** Marzo 2026 | **Estado:** Activa

**Contexto:** Necesitamos estado global mínimo (usuario actual, tenant, preferencias de UI).

**Decisión:** Zustand — API simple, sin boilerplate, TypeScript-first.

**Consecuencias:**
- ✅ < 5 líneas para crear un store
- ✅ Sin Provider hell
- ⚠️ Para estado del servidor, preferir React Query en V2

---

*Agregar una entrada por cada decisión técnica significativa.*
```

---

## PASO 7 — Crear docs/project/CHANGELOG.md

Crea `docs/project/CHANGELOG.md`:

```markdown
# CHANGELOG — PETER
> Registro cronológico de todos los cambios del proyecto.
> Actualizar con cada commit significativo o al final de cada sesión de trabajo.

## Formato de entrada
### [YYYY-MM-DD] — Descripción corta
**Tipo:** Feature | Fix | Refactor | Docs | Config | Security  
**Módulos afectados:** [lista de módulos]  
**Cambios:**
- Qué se agregó / cambió / eliminó
**Breaking changes:** [si aplica]

---

## Historial

### [2026-03-19] — Inicialización del proyecto
**Tipo:** Config  
**Módulos afectados:** Todo el proyecto  
**Cambios:**
- Setup inicial de Next.js 14 + TypeScript + Tailwind
- Configuración de sistema profesional de desarrollo (skills, PROJECT_BRAIN, ERROR_LOG)
- Archivos de contexto del negocio en docs/
```

---

## PASO 8 — Crear los Skills por Dominio

Crea cada uno de los siguientes archivos:

### docs/skills/architecture/SKILL.md

```markdown
# SKILL: Arquitectura y Base de Datos

## Cuándo consultar este skill
Antes de: crear una nueva tabla, diseñar una relación, crear una API route,
decidir dónde va la lógica de negocio, o refactorizar estructura de carpetas.

## Principios de Arquitectura en PETER

### Separación de responsabilidades
- `app/` → solo routing y presentación
- `app/api/` → validación de input + llamada a service
- `lib/services/` → lógica de negocio (aún por crear)
- `lib/supabase/` → acceso a datos
- `components/` → UI pura, sin lógica de negocio

### Diseño de Base de Datos
- SIEMPRE incluir `tenant_id` en tablas multi-tenant
- SIEMPRE incluir `created_at` y `updated_at` en todas las tablas
- SIEMPRE usar UUIDs como primary keys (gen_random_uuid())
- NUNCA eliminar columnas sin migración — usar soft delete con `deleted_at`
- SIEMPRE crear índices para columnas usadas en WHERE frecuente

### Patrón para nuevas tablas
```sql
CREATE TABLE nueva_tabla (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- campos de negocio aquí --
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_nueva_tabla_tenant ON nueva_tabla(tenant_id);
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON nueva_tabla
  USING (tenant_id = get_user_tenant_id() OR get_user_role() = 'super_admin');
```

### Patrón para API Routes
```typescript
// app/api/[recurso]/route.ts
export async function POST(req: NextRequest) {
  // 1. Verificar autenticación
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 2. Validar input con Zod
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  // 3. Ejecutar lógica de negocio
  // 4. Retornar resultado
}
```

### Cuándo usar Server vs Client Components
- Server Component: páginas, listas de datos, contenido estático
- Client Component: formularios, modales, componentes con state, animaciones
- Regla: si tiene `useState`, `useEffect`, o event handlers → Client Component
```

### docs/skills/design/SKILL.md

```markdown
# SKILL: Diseño Visual y Componentes

## Cuándo consultar este skill
Antes de: crear un nuevo componente visual, diseñar una nueva página,
elegir colores o tipografía, o implementar animaciones.

## Sistema de Diseño PETER

### Identidad Visual
Referencia: Goldman Sachs + Palantir + Stripe — terminal financiero de élite.
Oscuro, preciso, confiable. Nada de gradientes brillantes ni elementos playful.

### Jerarquía de Texto
```
Display XL (3rem / Sora 700):   títulos de página principales
Display LG (2.25rem / Sora 700): títulos de sección
Display MD (1.75rem / Sora 600): subtítulos importantes
Body LG (1.125rem / DM Sans 400): texto principal
Body MD (1rem / DM Sans 400):    texto estándar
Body SM (0.875rem / DM Sans 400): texto secundario, labels
Mono (0.875rem / JetBrains Mono): números, códigos, KPIs
```

### Componentes Base (todos ya en shadcn/ui)
- Botón primario: bg-accent-blue, hover con blue-glow shadow
- Botón secundario: border border-white/10, bg-bg-elevated
- Card: bg-bg-surface, border border-white/6, shadow-card
- Badge: rounded-full, tamaño pequeño, colores semánticos
- Input: bg-bg-elevated, border-white/10, focus border-accent-blue

### Espaciado (usar múltiplos de 4)
- xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px

### Animaciones Permitidas
- Entrada de página: fadeInUp 0.5s ease-out
- Hover en cards: translateY(-2px) + shadow intensificada
- Números/KPIs: counter animado con framer-motion
- Modales: scale 0.95→1 + opacity 0→1
- NO usar animaciones de más de 600ms — se siente lento

### Patrones de Layout
- Dashboard: grid de 4 columnas con cards de KPIs en la parte superior
- Listas: tabla con hover state, filas alternadas muy sutiles
- Formularios: máximo 2 columnas en desktop, 1 en móvil
- Sidebar: 240px colapsada a 60px en móvil
```

### docs/skills/security/SKILL.md

```markdown
# SKILL: Seguridad y Privacidad

## Cuándo consultar este skill
Antes de: manejar datos sensibles, implementar auth, crear endpoints públicos,
almacenar API keys, o implementar cualquier flujo de pagos.

## Reglas de Seguridad Obligatorias

### Variables de Entorno
- NEXT_PUBLIC_*: solo datos públicos (Supabase URL, anon key)
- Sin NEXT_PUBLIC_*: datos privados (service role, API keys de IA)
- NUNCA commitear .env.local — verificar que está en .gitignore

### Autenticación
- Siempre verificar auth al inicio de cada API route
- Usar `createClient()` del servidor (no del browser) en API routes
- El token JWT contiene el user_id — Supabase RLS lo usa automáticamente
- Magic links expiran en 1 hora — configurar en Supabase Dashboard

### API Keys de IA (modo BYOK)
- Encriptar con AES-256 antes de guardar en base de datos
- Desencriptar solo en el servidor, nunca en el cliente
- Rotar ENCRYPTION_SECRET cada 90 días
- Nunca loggear las keys — ni parcialmente

### Validación de Input
- Validar TODA entrada del usuario con Zod antes de procesarla
- Sanitizar texto libre antes de enviarlo a APIs de IA (remover caracteres de control)
- Validar tamaño de archivos antes de subir a Storage (máx 50MB)
- Validar tipos de archivo por extension Y por magic bytes (no solo el nombre)

### Row Level Security
- Toda tabla con datos de usuario DEBE tener RLS habilitado
- Probar con 2 tenants diferentes antes de deploy
- Nunca usar service_role key en el cliente browser

### Datos Personales (LFPDPPP — Ley Federal México)
- Documentos de clientes: cifrados en Supabase Storage
- Datos de contacto: no compartir entre tenants
- Derecho de eliminación: implementar soft delete con anonimización
- Aviso de privacidad: requerido antes de recopilar datos

### Checklist de Seguridad por Feature
- [ ] ¿El endpoint verifica autenticación?
- [ ] ¿El input está validado con Zod?
- [ ] ¿Los datos respetan RLS (tenant isolation)?
- [ ] ¿Las API keys están encriptadas?
- [ ] ¿Los errores no exponen información sensible?
- [ ] ¿Los archivos subidos están validados?
```

### docs/skills/testing/SKILL.md

```markdown
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
```

### docs/skills/devops/SKILL.md

```markdown
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
```

### docs/skills/ux/SKILL.md

```markdown
# SKILL: UX y Experiencia de Usuario

## Cuándo consultar este skill
Antes de: diseñar un nuevo flujo de usuario, crear un formulario,
diseñar estados de carga, o evaluar si algo es fácil de usar.

## Principios UX de PETER

### El usuario principal es un consultor ocupado
- Cada acción debe requerir el mínimo de clicks posible
- Los estados de carga deben ser informativos, no solo un spinner
- Los errores deben decir qué hacer, no solo que algo falló
- Los formularios largos deben mostrar progreso (wizard con pasos)

### Estados obligatorios en CADA componente
1. **Loading** — skeleton o spinner con mensaje contextual
2. **Empty** — ilustración + texto explicativo + acción primaria
3. **Error** — mensaje claro + botón de retry + contacto si es crítico
4. **Success** — confirmación visible (toast o estado verde)
5. **El caso feliz** — el contenido real

### Formularios
- Validación inline (no esperar al submit para mostrar errores)
- Labels siempre visibles (no placeholder como único label)
- Campos requeridos marcados claramente
- Auto-save en formularios largos (cada 30 segundos)
- Confirmación antes de acciones destructivas (eliminar, cancelar)

### Flujos Críticos (no romper nunca)
1. Login → Dashboard: máx 2 clicks desde la URL raíz
2. Nuevo cliente: formulario completo en menos de 5 minutos
3. Iniciar diagnóstico: de zero a processing en menos de 3 clicks
4. Invitar cliente al portal: 1 click desde el expediente

### Mensajes de Estado (ejemplos)
```
Loading diagnóstico: "PETER está analizando tu empresa con metodología Bain..."
Error de API:        "Hubo un problema conectando con el motor de IA. Intenta de nuevo."
Empty state clientes:"Aún no tienes clientes. ¿Empezamos con el primero?"
Success formulario:  "Cliente guardado correctamente."
```

### Accesibilidad Básica (a11y)
- Todos los botones e inputs deben tener label o aria-label
- Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande
- Navegable con teclado (Tab, Enter, Escape)
- Focus visible en todos los elementos interactivos
```

### docs/skills/performance/SKILL.md

```markdown
# SKILL: Performance y Optimización

## Cuándo consultar este skill
Antes de: agregar una nueva dependencia pesada, implementar una lista larga,
subir imágenes, o cuando algo se siente lento.

## Métricas Objetivo

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID / INP | < 100ms | Chrome DevTools |
| CLS | < 0.1 | Lighthouse |
| Bundle size (JS inicial) | < 200KB | `npm run build` |
| Tiempo de build | < 60s | Vercel |

## Reglas de Performance

### Imágenes
- SIEMPRE usar `next/image` — nunca `<img>` directo
- Definir width y height siempre
- Usar `priority` solo en la imagen más importante (LCP)
- Formatos: WebP para fotos, SVG para íconos

### Carga de datos
- Preferir Server Components para datos que no cambian frecuentemente
- Usar `loading.tsx` para Suspense automático en Next.js
- Para listas largas (>50 items): implementar paginación o virtualización
- Cachear resultados de APIs de IA que no cambien (React cache())

### Dependencias
- Antes de `npm install [paquete]`, verificar su tamaño en bundlephobia.com
- Preferir imports específicos: `import { format } from 'date-fns'` (no `import * as dateFns`)
- Lazy load componentes pesados: `const HeavyComponent = dynamic(() => import(...))`

### Base de datos
- EXPLAIN ANALYZE en queries que tarden más de 100ms
- Siempre filtrar por tenant_id primero (usa el índice)
- Limitar resultados: `.limit(50)` en listas paginadas
- Seleccionar solo columnas necesarias: `.select('id, name, status')` no `.select('*')`
```

### docs/skills/ai/SKILL.md

```markdown
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
```

### docs/skills/legal/SKILL.md

```markdown
# SKILL: Legal, Privacidad y Compliance

## Cuándo consultar este skill
Antes de: recopilar datos personales, integrar pagos, publicar la plataforma,
redactar términos de servicio, o manejar datos de clientes de los consultores.

## Marco Legal Aplicable (México)

### LFPDPPP — Ley Federal de Protección de Datos Personales
- **Aviso de Privacidad:** obligatorio antes de recopilar cualquier dato personal
- **Consentimiento:** explícito para datos sensibles (financieros, laborales)
- **Derechos ARCO:** Acceso, Rectificación, Cancelación, Oposición — deben ser ejercibles
- **Responsable:** SAP es responsable de los datos que recopila de sus clientes
- **Encargados:** Los consultores (tenants) son encargados de los datos de sus clientes

### Lo que PETER debe tener antes de lanzar
- [ ] Aviso de privacidad en el sitio web y en el registro
- [ ] Términos y Condiciones del servicio SaaS
- [ ] Política de cookies (si usas analytics)
- [ ] Contrato de procesamiento de datos con tenants (DPA)
- [ ] Proceso documentado para atender solicitudes ARCO

### Datos que se recopilan y su tratamiento
| Dato | Propósito | Retención | Base legal |
|------|-----------|-----------|-----------|
| Nombre y email del consultor | Cuenta de usuario | Mientras la cuenta esté activa | Contrato |
| Documentos de clientes del consultor | Diagnóstico | 2 años o hasta que el consultor los elimine | Contrato |
| Grabaciones de visitas | Diagnóstico | 1 año | Consentimiento |
| Datos de uso y analytics | Mejora del servicio | 2 años anonimizados | Interés legítimo |

### Contratos con Clientes
- El contrato de diagnóstico debe incluir: NDA, alcance, precio, forma de pago, IP
- El contrato de retainer: cláusula de terminación, confidencialidad, entregables
- Todos los contratos deben especificar que SAP puede usar IA para el análisis

### Propiedad Intelectual
- Los reportes generados pertenecen al cliente — SAP retiene el derecho de usar la metodología
- Los prompts y el motor de IA son IP de SAP — no compartir con clientes
- El código de PETER es confidencial — no es open source
```

### docs/skills/data/SKILL.md

```markdown
# SKILL: Datos, Analytics y Métricas

## Cuándo consultar este skill
Antes de: diseñar un dashboard, definir KPIs, implementar analytics,
o estructurar datos para reportes.

## KPIs del Negocio (deben estar en el dashboard)

### Métricas de Revenue
- MRR (Monthly Recurring Revenue) = suma de retainers + licencias activos
- ARR = MRR × 12
- One-time revenue del mes = diagnósticos + implementaciones
- Revenue total del mes = MRR + one-time

### Métricas de Crecimiento
- Nuevos clientes del mes
- Tasa de conversión diagnóstico → retainer (objetivo: >40%)
- Churn de retainers (objetivo: <5% mensual)
- NRR — Net Revenue Retention (objetivo: >110%)

### Métricas Operativas
- Diagnósticos completados en el mes
- Tiempo promedio de diagnóstico (objetivo: <72h)
- Tokens de IA consumidos y costo total
- Satisfacción del cliente (NPS — implementar en V2)

## Herramientas de Analytics

| Herramienta | Uso | Cuándo activar |
|-------------|-----|----------------|
| PostHog | Comportamiento del usuario en la plataforma | Desde V1 |
| Supabase Analytics | Uso de la base de datos | Siempre activo |
| Vercel Analytics | Performance del frontend | Desde V1 |
| Sentry | Errores en producción | Desde V1 |

## Estructura de Eventos para PostHog
```typescript
// Eventos a trackear desde el inicio
posthog.capture('diagnosis_started', { project_id, framework, client_id })
posthog.capture('diagnosis_completed', { project_id, findings_count, tokens_used, duration_ms })
posthog.capture('client_invited_to_portal', { client_id })
posthog.capture('retainer_created', { client_id, monthly_fee })
posthog.capture('report_downloaded', { project_id, format: 'pdf' })
```
```

### docs/skills/accessibility/SKILL.md

```markdown
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
<div onClick={handleSubmit}>Enviar</div>

// ✅ Bien  
<button onClick={handleSubmit} type="submit">Enviar</button>

// ❌ Mal
<div className="text-xl font-bold">Título</div>

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
```

### docs/skills/operations/SKILL.md

```markdown
# SKILL: Operaciones y Procesos Internos

## Cuándo consultar este skill
Antes de: documentar un proceso nuevo, diseñar un flujo de onboarding,
o definir SLAs de respuesta.

## Procesos Operativos de SAP

### Onboarding de Nuevo Consultor (tenant)
1. SAP crea el tenant manualmente en Super Admin
2. Invita al consultor por email (magic link de primer acceso)
3. Consultor configura su perfil y branding (V2: White Label)
4. SAP hace sesión de 30 min de capacitación en PETER
5. Consultor hace su primer diagnóstico con cliente real

### SLA de Respuesta
- Diagnóstico entregado: máx 72 horas desde kickoff
- Respuesta a mensajes del cliente: máx 24 horas hábiles
- Tiempo de inactividad de PETER: objetivo <0.1% (Vercel + Supabase garantizan >99.9%)
- Respuesta a bugs críticos: 2 horas en horario hábil

### Proceso de QC de Reportes
1. Motor IA genera hallazgos → status: processing
2. Consultor revisa y valida cada hallazgo → status: review
3. Socio SAP revisa el reporte completo → aprobación
4. Se genera el PDF y se marca como listo para entrega → status: delivered
5. Regla: ningún reporte sale sin validación del socio

### Monitoreo de la Plataforma
- Sentry: alertas de errores en tiempo real → canal de Slack #alerts
- Supabase Dashboard: uso de DB y Storage → revisar semanal
- Vercel Analytics: performance y errores de build → revisar en cada deploy
- PostHog: comportamiento de usuarios → revisar semanal
```

---

## PASO 9 — Agregar scripts útiles al package.json

Agrega estos scripts al `package.json` del proyecto:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "db:types": "supabase gen types typescript --local > lib/supabase/types.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "check": "npm run type-check && npm run lint && npm run test && npm run build",
    "brain": "echo 'Actualizando PROJECT_BRAIN...' && code docs/project/PROJECT_BRAIN.md"
  }
}
```

---

## PASO 10 — Verificación Final

Ejecuta en terminal:

```bash
# Verificar que toda la estructura fue creada
find docs/skills -name "SKILL.md" | sort
find docs/project -type f | sort
find .github -type f | sort
find .cursor -type f | sort

# Verificar que .gitignore incluye archivos sensibles
grep -E "\.env|\.env\.local" .gitignore

echo "✅ Sistema profesional de desarrollo configurado"
echo "📁 Skills disponibles:"
ls docs/skills/
echo ""
echo "📋 Archivos de proyecto:"
ls docs/project/
echo ""
echo "🤖 Copilot instructions:"
cat .github/copilot-instructions.md | head -5
```

---

## Resumen de lo que se creó

```
.github/copilot-instructions.md   ← Copilot lee esto automáticamente
.cursor/rules/main.mdc            ← Para usuarios de Cursor

docs/
├── skills/
│   ├── architecture/SKILL.md    ← DB, APIs, estructura del código
│   ├── design/SKILL.md          ← Sistema visual, componentes
│   ├── devops/SKILL.md          ← CI/CD, deploy, ambientes
│   ├── security/SKILL.md        ← Auth, privacidad, validación
│   ├── testing/SKILL.md         ← Unit, integration, E2E
│   ├── ux/SKILL.md              ← Flujos, formularios, estados
│   ├── performance/SKILL.md     ← Bundle, imágenes, queries
│   ├── ai/SKILL.md              ← Prompts, modelos, costos
│   ├── legal/SKILL.md           ← LFPDPPP, contratos, IP
│   ├── data/SKILL.md            ← KPIs, analytics, métricas
│   ├── accessibility/SKILL.md   ← a11y, WCAG, semántica
│   └── operations/SKILL.md      ← Procesos, SLAs, onboarding
└── project/
    ├── PROJECT_BRAIN.md         ← Estado actual del proyecto (actualizar siempre)
    ├── ERROR_LOG.md             ← Errores encontrados y cómo se resolvieron
    ├── DECISIONS.md             ← Por qué se tomaron las decisiones de arquitectura
    └── CHANGELOG.md             ← Historial cronológico de cambios
```

---

*Ejecuta este plan completo. Al terminar, confirma con: "Sistema configurado — X archivos creados"*
