# SKILL: Arquitectura y Base de Datos

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
