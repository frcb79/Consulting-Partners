# SKILL META: Ruteo Estrategico de Skills

## Proposito
Identificar rapidamente cual skill(s) aplicar segun el tipo de problema, decision o task que enfrentes.
Evita redundancia, asegura cobertura de riesgos y ordena el flujo de trabajo optimalmente.

## Metadata Operativa
- Version: 1.0.0
- Owner: SAP Product + Tech Lead
- Ultima revision: 2026-03-28
- Frecuencia de revision: trimestral

## Arbol de Decision

### 1. Tipo de Problema: NEGOCIO Y ESTRATEGIA
**Indicadores**: planes trimestrales, roadmap, prioridades, alineacion, presupuesto, expansion.

**Invocar Skills**:
1. **strategy-orchestrator** (primaria)
   - Genera: baseline, objetivos, iniciativas priorizadas, plan 30/60/90
   - Output: documento de plan con tabla de iniciativas y riesgos
2. **metrics-reporting** (paralela)
   - Input: plan del orquestador
   - Output: KPIs de seguimiento y tablero de control
3. **operations** (referencia)
   - Por si el plan impacta procesos internos o SLAs

---

### 2. Tipo de Problema: PRODUCTO Y UX
**Indicadores**: nuevas features, usabilidad, formularios, flujos de usuario, experiencia de usuario.

**Invocar Skills en orden**:
1. **ux** (primaria) — diseña el flujo
2. **design** (paralela) — asegura visual y brand alignment
3. **accessibility** (paralela) — WCAG compliance
4. **performance** (paralela si hay datos) — carga y velocidad
5. **testing** (cierre) — que probar antes de launch

**Definition of Done**: User story aceptada, componentes con test, acces
ibilidad verificada, rendimiento OK.

---

### 3. Tipo de Problema: ARQUITECTURA Y DATOS
**Indicadores**: nueva tabla, API route, schema, migracion, relacion entre datos, estructura de carpetas.

**Invocar Skills en orden**:
1. **architecture** (primaria) — diseña la estructura
2. **data** (paralela) — defines el modelo de datos y queries
3. **security** (paralela) — valida RLS, encryption, isolation
4. **performance** (paralela) — indexes, query optimization
5. **testing** (cierre) — test de RLS con 2 tenants, validacion de datos

**Definition of Done**: Schema creado, indices criticos, RLS verificado, noSQL queries optimizadas, test de aislamiento pasa.

---

### 4. Tipo de Problema: SEGURIDAD Y COMPLIANCE
**Indicadores**: manejo de data sensible, auth, encriptacion, privacidad, pagos, regulaciones.

**Invocar Skills en orden**:
1. **security** (primaria) — reglas de seguridad
2. **legal** (paralela) — compliance, contratos, LFPDPPP
3. **architecture** (referencia) — si toca schema o auth
4. **testing** (cierre) — security audit, penetration tests

**Definition of Done**: Todos los checkpoints en security SKILL completados, legal review aprobado, tests passed.

---

### 5. Tipo de Problema: IA Y MODELOS
**Indicadores**: prompts nuevos, integracion de modelos, streaming, optimizacion de costos, evaluacion de salida IA.

**Invocar Skills en orden**:
1. **ai** (primaria) — estructura de prompts, modelos, streaming
2. **metrics-reporting** (paralela) — para trackeo de tokens y costos
3. **testing** (paralela) — test de salida IA, edge cases
4. **performance** (si aplica) — latencia de respuesta

**Definition of Done**: Prompt documentado, modelo seleccionado, costo calculado, test de calidad.

---

### 6. Tipo de Problema: DESPLIEGUE Y OPERACION
**Indicadores**: deploy a produccion, variables de entorno, ambientes, monitoreo, CI/CD, rollback.

**Invocar Skills en orden**:
1. **devops** (primaria) — flujo de deploy, variables, CI/CD
2. **security** (paralela) — valida secretos, keys, encryption
3. **performance** (paralela) — tiempo de build, bundle size
4. **operations** (referencia) — SLAs, monitoreo, rollback plan

**Definition of Done**: Deploy checklist passed, variables verificadas, tests OK, monitoreo activo.

---

### 7. Tipo de Problema: TESTING Y CALIDAD
**Indicadores**: nueva feature test, regression, coverage, QC antes de release, e2e flows.

**Invocar Skills en orden**:
1. **testing** (primaria) — que, como y cuando testar
2. **security** (paralela si es auth) — tests de RLS, validacion
3. **architecture** (referencia) — si involucra tablas nuevas
4. **accessibility** (paralela si es UI) — a11y compliance

**Definition of Done**: Test coverage >= 80%, test pasa, no regressions, manual QC OK.

---

### 8. Tipo de Problema: DESIGN Y BRANDING
**Indicadores**: nueva interfaz, componentes visuales, sistema de diseño, animaciones, tipografia.

**Invocar Skills en orden**:
1. **design** (primaria)
2. **ux** (paralela) — usabilidad + navegacion
3. **accessibility** (paralela) — a11y, contraste
4. **performance** (paralela si tiene imagenes) — asset optimization

**Definition of Done**: Design system aligeado, componentes en shadcn/ui, accesibilidad comprobada, performance OK.

---

## Decision Matrix (Rapida)

| Problema | 1er Skill | 2do Skill | 3er Skill | Salida Esperada |
|----------|-----------|-----------|-----------|-----------------|
| "¿Que hacemos los proximos 90 dias?" | strategy-orchestrator | metrics-reporting | operations | Plan con KPIs |
| "Como diseñamos el nuevo flujo de cliente?" | ux | design | accessibility | User flow diagram + specs |
| "Necesitamos nueva tabla de datos" | architecture | data | security | SQL + RLS policies + test |
| "Falla la autenticacion en prod" | security | devops | testing | Root cause + fix + test |
| "Mejorar el prompt de diagnostico" | ai | metrics-reporting | testing | Prompt v2 + benchmarks |
| "Hacer deploy a produccion" | devops | security | performance | Deploy checklist + go/no-go |
| "¿Es WCAG 2.1 AA compliant?" | accessibility | ux | design | Audit report + fixes |
| "¿Como rastreamos metricas clave?" | metrics-reporting | data | operations | Dashboard spec + queries |

---

## Flujo de Trabajo Recomendado

1. **Identifica el tipo de problema** usando el arbol de decision.
2. **Invoca skills en el orden indicado** (primaria paralela, luego cierre).
3. **Aplica la Definition of Done** al terminar cada skill.
4. **Combina outputs** en un documento o PR de decision.
5. **Documenta aprendizajes** en el skill correspondiente si hace falta.

---

## Cuando NO Invocar Skills

- Si es una pregunta conceptual sin accion (usar la busqueda de repo, no un skill).
- Si la decision ya fue tomada y documentada en PROJECT_BRAIN.md.
- Si es solo debugging / troubleshooting (usa testing skill si aplica).
- Si es una query simple que no requiere framework (ej: "¿cuales son los tests?" → lee testing/SKILL.md directo).

---

## Anti-Patrones

- ❌ Invocar todos los skills para todo problema (desperdicia contexto, introduce ruido).
- ❌ Usar skill sin leer su "Definition of Done".
- ❌ Ignorar los "riesgos" listados por un skill.
- ❌ No combinar skills cuando indica la matriz de decision.
- ❌ Cerrar sin una decision recomendada documentada.
