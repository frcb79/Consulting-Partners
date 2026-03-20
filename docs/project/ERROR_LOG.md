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
