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
