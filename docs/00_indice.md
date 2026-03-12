# PETER — Documentación del Proyecto
## Strategic AI Partners | Índice de Conocimiento para Copilot/Cursor

<!--
  INSTRUCCIÓN PARA COPILOT / CURSOR — LEER PRIMERO:

  Esta carpeta /docs contiene el conocimiento de negocio completo de PETER.
  Es el contexto que necesitas para generar código correcto y coherente con el producto.

  CUÁNDO CONSULTAR CADA ARCHIVO:
  
  - Trabajando en lib/ai/prompts/          → 01_frameworks.md
  - Trabajando en components/projects/     → 01_frameworks.md + 04_proceso_servicio.md
  - Trabajando en components/documents/    → 02_fuentes.md + 03_ia_fieldwork.md
  - Trabajando en app/api/ai/             → 01_frameworks.md + 03_ia_fieldwork.md
  - Trabajando en components/clients/     → 05_alianzas.md (campo lead_source)
  - Trabajando en app/analytics/          → 06_modelo_negocio.md
  - Trabajando en app/settings/billing/   → 06_modelo_negocio.md
  - Trabajando en cualquier tipo o enum   → verificar en el archivo correspondiente
  
  REGLA DE ORO: Si estás a punto de hardcodear un texto, precio, categoría o estado
  que parece de negocio, primero busca si ya está definido en estos archivos.
-->

---

## Archivos en esta Carpeta

| Archivo | Contenido | Tablas/Campos Relacionados |
|---------|-----------|--------------------------|
| `01_frameworks.md` | 90+ frameworks por área, con clave DB para cada uno | `projects.framework` |
| `02_fuentes.md` | Fuentes de datos (Statista, INEGI, etc.), costos, categorías de biblioteca | `documents.source`, `documents.type` |
| `03_ia_fieldwork.md` | Stack de grabación (Jamie, Fireflies, Otter), flujo post-visita, guiones | `documents.type = 'transcript'` |
| `04_proceso_servicio.md` | 8 fases del servicio, diferenciadores, estados del proyecto | `projects.status` |
| `05_alianzas.md` | 8 tipos de aliados, comisiones, scripts de contacto | `clients.lead_source` |
| `06_modelo_negocio.md` | 4 revenue streams, precios, costos fijos, KPIs financieros | `projects.type`, `retainers`, `subscriptions` |

---

## Glosario Rápido del Negocio

| Término | Significado en PETER |
|---------|---------------------|
| **Diagnóstico** | Análisis estratégico completo. Tipo de proyecto más común. $70K–$120K MXN |
| **Retainer** | Acompañamiento mensual post-diagnóstico. $15K–$25K MXN/mes |
| **Fieldwork** | Visitas del asociado a las áreas del cliente para entrevistar y grabar |
| **Hallazgo** | Finding generado por la IA, validado por el socio. Tabla `findings` |
| **So What?** | La implicación estratégica de cada hallazgo — por qué importa |
| **Palanca** | Recomendación de alto impacto. Tabla `recommendations` |
| **QC** | Quality Control — revisión obligatoria del socio antes de entregar |
| **Tenant** | Cada consultor o firma que usa PETER (multi-tenant). Tabla `tenants` |
| **White Label** | PETER con la marca del consultor, no de SAP |
| **BYOK** | Bring Your Own Keys — el consultor usa sus propias API keys de IA |
| **MRR** | Monthly Recurring Revenue — suma de retainers + licencias activos |
| **Bain-grade** | Estándar de calidad de un reporte de Bain & Company |
| **MECE** | Mutually Exclusive, Collectively Exhaustive — el framework base de SAP |
| **Socio** | El ex-Partner de Bain que valida cada reporte antes de entregarlo |
| **Asociado** | El consultor junior que hace las visitas de fieldwork |

---

## Stack Técnico (referencia rápida)

```
Frontend:     Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui dark
Animaciones:  Framer Motion
Backend:      Supabase (PostgreSQL + Auth + Storage + Realtime)
IA:           Claude Sonnet (análisis) + GPT-4o (validación) + Gemini (extracción)
Deploy:       Vercel (frontend) + Supabase Cloud (backend)
Email:        Resend.com
Grabación:    Jamie.ai (presencial) + Fireflies.ai (virtual)
```

## Paleta de Colores (referencia para nuevos componentes)

```css
--bg-base:        #070B14   /* fondo más profundo */
--bg-surface:     #0D1421   /* cards y paneles */
--bg-elevated:    #111E30   /* modales */
--accent-blue:    #1E6FD9   /* acciones primarias */
--accent-gold:    #D4A017   /* badges premium, branding SAP */
--text-primary:   #F1F5F9
--text-secondary: #94A3B8
--status-success: #16A34A
--status-warning: #D97706
--status-danger:  #DC2626
```

## Fuentes (Google Fonts)

```
Headings / Display:  Sora (700, 600)
Body / UI:           DM Sans (400, 500)
Números / Código:    JetBrains Mono (400, 700)
```
