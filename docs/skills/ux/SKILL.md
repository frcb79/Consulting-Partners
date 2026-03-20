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
