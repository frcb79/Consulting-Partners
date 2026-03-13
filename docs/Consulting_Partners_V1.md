
Consulting Partners
Strategic AI Partners Platform
 
ESPECIFICACIÓN DE VERSIÓN 1.0
Scope · Criterios de Aceptación · Definición de Listo
Marzo 2026  |  Uso Interno  |  Confidencial
 
Criterio de Éxito de la V1

La V1 de Consulting Partners cumple su objetivo cuando las tres condiciones siguientes son verdaderas simultáneamente:
 
DEMO CON SOCIO	El socio de Bain puede ver un diagnóstico completo generado desde cero en la plataforma — sube un PDF, elige un framework, ve la pantalla de procesamiento y recibe hallazgos reales validados — sin que el demo se rompa en ningún punto.
 
PRIMER CLIENTE REAL	Un cliente de empresa mediana puede ser dado de alta, recibir su diagnóstico, acceder a su portal y ver sus reportes. Todo con datos reales, no mocks. El consultor puede cobrar por este servicio con confianza.
 
PRESENTACIÓN A INVERSIONISTA	La plataforma puede mostrarse como producto funcional con arquitectura sólida, datos reales en Supabase, y un flujo de valor claro de inicio a fin. No es una maqueta — es software que corre en producción.
 
 
Resumen de Scope — V1

6 módulos funcionales con datos reales. Login sin roles de White Label (solo consultor SAP). Sin Stripe ni facturación automática.
 
Módulo	¿En V1?	Nivel	Notas
Login + Auth (consultor y cliente)	SÍ	Funcional	Magic link + email/password. Sin registro público.
Alta de clientes y expediente	SÍ	Funcional	CRUD completo. Todas las secciones del formulario.
Motor de diagnóstico con IA real	SÍ	Funcional	Claude + GPT-4o. PDF → hallazgos → validación QC.

Repositorio de documentos	SÍ	Funcional	Upload a Supabase Storage. Biblioteca de inteligencia.
Chat consultor IA por cliente	SÍ	Funcional	Streaming. Contexto del cliente cargado automáticamente.
Retainers con KPI monitor	SÍ	Funcional	Alta de retainer, KPIs manuales, historial de sesiones.
Portal del cliente final	SÍ	Funcional	Solo lectura. Magic link de invitación. Reportes + retainer.
Exportar PDF del reporte	SÍ	Básico	PDF con diseño SAP. Sin PPT en V1.
Super Admin (SAP)	PARCIAL	Básico	Solo lista de tenants y consumo. Sin gestión avanzada.
White Label (logo + colores)	NO	V2	Cada tenant con su marca. Se construye en V2.
BYOK — API keys propias	NO	V2	Solo modo SAP-Managed en V1.
Stripe / facturación automática	NO	V2	Facturación manual en V1.
Exportar PowerPoint	NO	V2	Solo PDF en V1.
Búsqueda semántica en documentos	NO	V2	Búsqueda por texto en V1.
App móvil	NO	V3	PWA o React Native más adelante.
 
Especificación por Módulo

 
01	Autenticación y Roles
Login universal que detecta el rol y redirige correctamente
Pantalla de login	Email + contraseña. Opción de magic link por email. Diseño oscuro con logo Consulting Partners.
Roles soportados	consultant (acceso al workspace /app) y client (acceso al portal /portal). super_admin a /admin.
Redirección por rol	Al entrar, detecta el rol del usuario y redirige a su área correcta automáticamente.
Sesión persistente	JWT con refresh token. La sesión no expira al cerrar el navegador.
Recuperar contraseña	Email de recuperación via Resend. Flujo completo.
Middleware de protección	Todas las rutas /app, /portal y /admin requieren sesión activa. Sin sesión → /login.

 
02	Alta de Clientes y Expediente
Gestión completa del ciclo de vida del cliente
Lista de clientes	Tabla con: nombre, industria, tamaño, status, # proyectos. Filtros y búsqueda en tiempo real.
Formulario de alta	4 secciones: Info de empresa, Contacto principal, Contexto estratégico (reto principal), Comercial. Multi-sección sin tabs — todo en una página larga.
Expediente del cliente	Tabs: Overview (KPIs) | Proyectos | Retainer | Documentos | Chat IA | Notas internas.
Estados del cliente	Prospect → Active → Retainer → Inactive. Cambio manual desde el expediente.

Notas internas	Texto libre solo visible para el consultor. Nunca se muestra al cliente en el portal.
Acciones rápidas	Desde el expediente: Nuevo diagnóstico | Invitar al portal | Subir documento | Iniciar retainer.
Criterio de aceptación	El consultor puede dar de alta un cliente en menos de 5 minutos y tener su expediente completo accesible desde el mismo día.
 
03	Motor de Diagnóstico con IA Real
El corazón de Consulting Partners — de PDF a hallazgos en minutos
Paso 1 — Configuración	Selección de cliente, título, tipo de análisis, framework (visual con cards), áreas a analizar (checkboxes con íconos).
Paso 2 — Documentos	Upload de PDFs, Excel y Word del cliente. Selector de documentos de la biblioteca. Campo de texto libre para info adicional.
Paso 3 — Config IA	Tabla de asignación de modelo por tarea (Claude/GPT-4o/Gemini). Toggles: validación cruzada, modo turbo, búsqueda web. Slider de nivel de detalle.
Pantalla de procesamiento	Full-screen animada. Timeline de 7 pasos con estado en tiempo real. Contador de tokens y costo. Tiempo transcurrido.
Modelos activos en V1	Claude Sonnet para análisis principal y redacción. GPT-4o para validación cruzada. Gemini para extracción inicial si está activado.
Validación QC	El consultor revisa cada hallazgo: título, cuerpo y 'So What?' editables inline. Botones: Validar | Editar | Rechazar | Agregar manual.
Regeneración parcial	El consultor puede seleccionar hallazgos rechazados, escribir instrucciones adicionales y regenerar solo esos hallazgos.
Frameworks en V1	MECE, Full Potential, McKinsey 7S, Porter 5 Fuerzas, BMC, Custom.
Criterio de aceptación	Sube un PDF real de empresa, elige MECE, procesa y obtiene mínimo 4 hallazgos con titulo, cuerpo, So What e impacto estimado. El proceso completo toma menos de 3 minutos.
 
 
04	Repositorio de Documentos
Gestión centralizada de toda la inteligencia del negocio
Upload	Drag & drop o selector. Hasta 50MB por archivo. Formatos: PDF, Excel, Word, CSV, TXT, imágenes. Hasta 10 archivos simultáneos.
Organización	Cada archivo se asigna a: cliente específico + proyecto, cliente sin proyecto, o biblioteca global del tenant.
Procesamiento IA automático	Al subir un PDF, Claude genera un resumen de 3 líneas y sugiere tags y categoría. Sin intervención manual.
Biblioteca de inteligencia	Sección separada para estudios de mercado (Statista, INEGI, IBISWorld, etc.). Compartida entre todos los proyectos del tenant.
Previsualización	PDFs se presualizan inline sin descarga. Excel y Word muestran metadatos + resumen IA.
Búsqueda	Búsqueda por nombre y tags. En V1 no hay búsqueda semántica (eso es V2).
Compartir con cliente	Toggle por documento: 'Visible en portal del cliente'. El cliente solo ve los documentos marcados.
Criterio de aceptación	Un consultor puede subir 5 documentos de distintos tipos, asignarlos a un cliente, ver su resumen generado por IA y marcar 2 de ellos para que sean visibles en el portal del cliente.
 
05	Chat Consultor IA por Cliente
Acceso a un consultor estratégico que conoce al cliente
Contexto automático	Al abrir el chat de un cliente, la IA ya tiene cargado: expediente del cliente, todos sus diagnósticos anteriores, documentos subidos y notas del consultor.
Streaming en tiempo real	La respuesta aparece palabra por palabra. No hay espera para ver el resultado completo.
Modelo	Claude Sonnet con prompt de Sistema de Partner Senior Bain. Responde en español.
Historial persistente	Las conversaciones se guardan en Supabase y son recuperables en cualquier momento.
Contexto por sesión	El chat mantiene el hilo de la conversación dentro de la misma sesión. Al abrir en otra pestaña, inicia nueva sesión.
Acceso desde	Pestaña 'Chat IA' del expediente del cliente. También desde el detalle del retainer activo.
Ejemplos de uso	'¿Cómo está evolucionando el EBITDA vs. la meta?' | '¿Qué iniciativas están pendientes?' | 'Resume los hallazgos del último diagnóstico para presentar al Director General.'
Criterio de aceptación	El consultor pregunta sobre un cliente, la IA responde con información específica del cliente (no genérica), la respuesta aparece en streaming y queda guardada en el historial.
 
 
06	Retainers con KPI Monitor
Seguimiento mensual del valor generado para el cliente
Alta de retainer	Desde el expediente del cliente: fee mensual, fecha de inicio, scope del retainer (texto libre + checklist de entregables mensuales).
Definición de KPIs	El consultor define hasta 8 KPIs a monitorear (nombre, unidad, valor baseline del diagnóstico inicial, meta).
Registro de lecturas	En cada sesión, el consultor registra el valor actual de cada KPI. Se guarda el historial.
Visualización	Gráfica de línea para cada KPI mostrando evolución vs. baseline y meta. Semáforo de estado (verde/amarillo/rojo).
Sesiones	Alta de sesiones con: fecha, agenda (generada por IA o manual), notas, resumen, action items con responsable y fecha.
Preparación automática de sesión	Botón 'Preparar sesión' genera agenda propuesta con base en KPIs actuales, action items pendientes y tiempo desde la última sesión.
Criterio de aceptación	El consultor puede crear un retainer, definir 3 KPIs, registrar 2 lecturas y ver la gráfica de evolución. Puede crear una sesión con su agenda y action items.
 
07	Portal del Cliente Final
El cliente ve su progreso sin acceso al workspace del consultor
Invitación	El consultor genera un magic link desde el expediente del cliente. El cliente accede sin necesidad de contraseña.
Aislamiento total	El cliente solo ve su propia información. No puede ver otros clientes, ni el workspace del consultor, ni datos internos.
Dashboard	Saludo personalizado. Próxima sesión de retainer. Resumen de últimos hallazgos. Documentos recientes.
Mis reportes	Lista de reportes entregados. Preview inline del PDF. Descarga disponible. Badge 'Nuevo' en reportes no vistos.
Estado del retainer	KPIs con semáforo visual. Próxima sesión. Action items que le corresponden al cliente.
Documentos	Solo los marcados como visibles por el consultor. Solo lectura — no puede subir archivos.
Branding	En V1: logo de Consulting Partners. En V2: logo del consultor (White Label).
Criterio de aceptación	El consultor genera un magic link, el cliente lo abre en navegador limpio (sin sesión), ve sus reportes y su retainer sin poder acceder a ningún otro dato de la plataforma.
 
 
Criterios de Aceptación Técnicos

Estos criterios aplican a toda la plataforma, no solo a módulos individuales.
 
Criterio	Estándar mínimo V1	Cómo verificarlo
Rendimiento	Primera carga en <3s. Navegación entre páginas <500ms.	Lighthouse en Chrome DevTools. Score >80 en Performance.
Seguridad RLS	Ningún usuario puede ver datos de otro tenant.	Test: crear 2 usuarios de distinto tenant, verificar que no se ven entre sí en Supabase.
Subida de archivos	PDF de 20MB sube correctamente y genera resumen IA.	Test manual con archivo real de cliente.
Diagnóstico completo	De carga de PDF a hallazgos validados en <5 minutos.	Cronometrar con PDF de 10-15 páginas.
Chat streaming	Primera respuesta visible en <2 segundos.	Test con pregunta simple sobre un cliente.
Portal del cliente	Magic link funciona en ventana de incógnito.	Generar link, abrirlo en incógnito, verificar acceso solo a datos del cliente.
Mobile responsive	Todas las vistas son usables en pantalla de 375px.	Chrome DevTools modo móvil en iPhone 12.
Manejo de errores	Ningún error de la API de IA rompe la interfaz.	Desconectar internet durante un diagnóstico — debe mostrar error amigable.
Datos en Supabase	Todos los datos se persisten — al recargar la página, todo está igual.	Hacer una acción, recargar, verificar que persiste.
Exportar PDF	PDF generado se ve bien y se puede descargar.	Generar PDF de un diagnóstico real, abrirlo en Preview/Acrobat.
 
Lo que NO está en V1 — y por qué

Estas decisiones no son errores ni olvidos — son trade-offs deliberados para llegar a V1 en 4 semanas con calidad, no en 3 meses con todo pero roto.
 
Feature excluida	Por qué no está en V1	Cuándo entra
White Label (branding por tenant)	Requiere sistema de temas dinámicos. No crítico para la demo ni para el primer cliente de SAP.	V2 — Semana 5-6
BYOK (API keys propias)	Requiere encriptación avanzada y UX de setup. El primer consultor externo puede usar las keys de SAP.	V2 — Semana 7
Exportar PowerPoint	pptxgenjs requiere diseño detallado de cada slide. El PDF cubre el 90% de los casos.	V2 — Semana 5
Búsqueda semántica	pgvector + embeddings requieren pipeline de procesamiento complejo. Búsqueda por texto cubre V1.	V2 — Semana 6
Stripe / Facturación automática	El primer cliente se factura manualmente. Stripe agrega complejidad antes de validar el modelo.	V2 — Semana 8
App móvil nativa	La plataforma es responsive. Los consultores trabajan en laptop. Móvil es nice-to-have.	V3
Integraciones (Zapier, CRM)	Requiere API pública y documentación. Sin clientes externos no hay demanda real.	V3
Multi-idioma (inglés)	El mercado objetivo en V1 es 100% México. Inglés agrega complejidad sin valor inmediato.	V3
Registro público de consultores	El acceso es por invitación de SAP. No hay self-service en V1.	V2 cuando existan 3+ tenants
Video en sesiones de retainer	Integración con Zoom/Teams requiere OAuth y manejo de webhooks complejos.	V3
 
Timeline de Desarrollo — 4 Semanas

 
Semana 1  Base sólida funcionando
Día 1	Setup completo del proyecto. Next.js + Tailwind + shadcn/ui + Supabase conectado. Variables de entorno. Schema SQL ejecutado.
Día 2	Login funcional (email + magic link). Middleware de roles. Redirección automática por rol.
Día 3	Layout con Sidebar colapsable + Header. Dashboard con 4 stat cards (datos reales de Supabase).
Día 4	Módulo Clientes: lista, formulario de alta completo, guardado en Supabase.
Día 5	Expediente del cliente con tabs. Validación del formulario. Deploy a Vercel.
Entregable:  Login + Dashboard + Clientes funcionando en Vercel
 
Semana 2  Motor de diagnóstico end-to-end
Día 1	Upload de documentos a Supabase Storage. Extracción de texto de PDFs.
Día 2	Wizard de nuevo diagnóstico: configuración + documentos + config IA.
Día 3	API Route /api/ai/diagnose. Integración real con Claude API. Guardado de hallazgos.
Día 4	Processing Screen animada. Vista de validación QC con edición inline.
Día 5	Vista del reporte en web. Exportación PDF básica. Tests de extremo a extremo.
Entregable:  Diagnóstico completo: PDF → hallazgos → reporte → PDF descargable

 
Semana 3  Chat IA + Retainers + Documentos
Día 1	Chat con streaming (SSE). Contexto del cliente cargado automáticamente.
Día 2	Historial del chat. Chat accesible desde expediente y retainer.
Día 3	Módulo Retainers: alta, definición de KPIs, registro de lecturas, gráficas.
Día 4	Sesiones del retainer: agenda IA, action items, historial.
Día 5	Biblioteca de documentos: categorías, tags, resumen IA automático. Búsqueda por texto.
Entregable:  Chat IA funcional + Retainer con KPIs + Repositorio de documentos organizado
 
Semana 4  Portal del cliente + Pulido + Demo-ready
Día 1	Portal del cliente: magic link de invitación. Dashboard del cliente.
Día 2	Portal: vista de reportes + descarga PDF. Vista de retainer con KPIs.
Día 3	Super Admin básico: lista de tenants + consumo de IA. Notificaciones.
Día 4	Bug fixes, ajustes de UX, mensajes de error amigables, loading states.
Día 5	Demo final con datos reales. Deploy a producción. Checklist de criterios de aceptación.
Entregable:  V1 completa — lista para demo con socio, primer cliente real e inversionista
 
 
Checklist de Demo — 15 Minutos con el Socio

Este es el flujo exacto de la demo. Cada paso debe funcionar sin errores.
 
00:00 – 01:00	Abrir la plataforma en el navegador. Mostrar el login. Entrar como consultor. Ver el dashboard con datos reales — KPIs, proyectos recientes, actividad IA.
01:00 – 02:00	Ir a Clientes. Mostrar la lista. Abrir el expediente de Grupo Industrial Omega (cliente pre-cargado con datos completos).
02:00 – 04:00	Ir a Proyectos → Nuevo Diagnóstico. Seleccionar a Omega como cliente. Framework MECE. Subir el PDF del estado financiero (pre-preparado). Seleccionar áreas: Finanzas + Operaciones.

04:00 – 07:00	Iniciar el diagnóstico. Ver la pantalla de procesamiento en vivo — el timeline animado, el contador de tokens, los modelos trabajando. Comentar lo que está pasando al socio.
07:00 – 09:00	Ver los hallazgos generados. Editar un hallazgo inline para mostrar que es editable. Validar 3 de 5. Mostrar el botón de regenerar el rechazado con instrucciones adicionales.
09:00 – 10:30	Ir al reporte web. Navegar las secciones. Descargar el PDF. Mostrarlo — que se vea exactamente como el reporte de ejemplo que ya conoce el socio.
10:30 – 12:00	Abrir el Chat IA del cliente. Preguntar: '¿Cuál es el hallazgo más crítico de Omega y qué deberíamos hacer primero?' Ver la respuesta en streaming con contexto real del cliente.
12:00 – 13:00	Abrir el Retainer de Omega. Ver los KPIs con las gráficas de evolución. Mostrar la sesión programada y su agenda generada por IA.
13:00 – 14:00	Abrir el portal del cliente en ventana de incógnito con el magic link. Mostrar que el cliente ve sus reportes y retainer — sin ver el workspace del consultor.
14:00 – 15:00	Volver al dashboard. Mostrar el consumo de IA del día. Cerrar con: 'Todo lo que viste corre con datos reales en la nube.'
 
