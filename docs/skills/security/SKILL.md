# SKILL: Seguridad y Privacidad

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
