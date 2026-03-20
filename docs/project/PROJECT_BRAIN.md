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
