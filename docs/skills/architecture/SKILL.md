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
