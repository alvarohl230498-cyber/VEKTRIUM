# VEKTRIUM OS — Tablero de proyectos por fase + correcciones de agenda

**Fecha:** 2026-07-30
**Estado:** Aprobado por el usuario, listo para plan de implementación
**Depende de:** SP-0/SP-1 (ya construido: modelo de fases, Planner de tareas, agenda)
**Relación con SP-4:** ninguna. SP-4 (`2026-07-29-vektrium-sp4-planificacion.md`) es Gantt,
dependencias y línea base — un sub-proyecto futuro y mucho más grande. Este documento es una
extensión pequeña y autocontenida de lo que ya existe, no un adelanto de SP-4.

---

## 1. Contexto

El usuario reportó tres carencias del portal privado tras usarlo con datos reales:

1. El formulario de "Nueva reunión" pierde todo lo escrito cuando falla una validación.
2. No hay forma de pegar el enlace real de Google Meet al crear la reunión — solo después.
3. No existe ninguna vista que muestre en qué fase de entrega está cada proyecto, ni una forma
   ágil de moverlo de fase a medida que avanza el trabajo.

Los tres se resuelven en un solo ciclo porque son correcciones y una extensión acotada sobre
código ya existente (agenda, proyectos, fases), no un subsistema nuevo.

---

## 2. Bug — el formulario de reunión se vacía al fallar

### Causa raíz

`NewMeetingForm` (`src/app/os/agenda/meeting-form.tsx`) usa `useActionState` con inputs no
controlados (`defaultValue` estático, sin ligar a lo escrito). React 19 limpia todo formulario
no controlado **antes** de ejecutar la Server Action (`requestFormReset$1`, comportamiento de
framework, no un bug de la app). Como `MeetingActionState` nunca guarda de vuelta los valores
enviados, no hay nada con qué re-llenar los campos cuando la validación falla — el usuario ve el
formulario en blanco con un mensaje de error genérico.

### Solución

- `MeetingActionState` gana un campo `values: Record<string, string | string[]>` con lo último
  enviado (texto plano; sin campos sensibles en este formulario).
- `fail()` en `actions.ts` siempre devuelve `values` junto a `fieldErrors`/`formError`.
- Cada input pasa de `defaultValue` estático a `defaultValue={state.values.<campo> ?? <default>}`.
- El `<form>` recibe `key={state.submissionId}` (contador que `createMeetingAction` incrementa en
  cada intento, éxito o fallo). Esto fuerza a React a remontar el formulario con los nuevos
  `defaultValue` en vez de reutilizar el DOM ya limpiado — sin el remount, `defaultValue` no
  vuelve a aplicarse porque React solo lo lee en el montaje inicial.
- Los checkboxes de asistentes (arreglo de ids) se preservan igual, vía `values.attendeeIds`.

### Resultado esperado

Si falla la validación (ej. "agenda" con menos de 10 caracteres), el usuario ve exactamente lo
que escribió — cliente, tipo, título, organizador, fecha, hora, duración, asistentes marcados —
con solo el campo problemático señalado en rojo. Nada que reescribir salvo lo que realmente falta.

---

## 3. Enlace de Meet al crear la reunión

### Cambio

Se elimina el checkbox `createMeet` ("Crear videollamada, Meet simulado") del formulario de
creación. En su lugar, un campo de texto opcional:

> **Enlace de Meet** — pégalo si ya lo creaste en Google Meet (opcional)

Validación: si se llena, debe ser una URL válida (mismo `z.url()` que ya usa
`meetingLinkSchema` — se reutiliza, no se duplica). Si se deja vacío, la reunión se crea sin
enlace, exactamente como si no se hubiera enviado nada — se puede pegar después con el editor
"Enlace de reunión" que ya existe en cada tarjeta.

`createMeetingAction` deja de llamar a `getCalendarProvider()`/`MockCalendarProvider` en la
creación: si se pegó un enlace, se guarda con `isMock: false`, `providerEventId: null`,
`syncStatus: 'sincronizada'` (mismos valores que ya usa `updateMeetingLinkAction` para un enlace
real). El módulo `src/integrations/calendar/` no se toca — queda intacto para cuando se conecte
Google Calendar de verdad más adelante; simplemente deja de invocarse desde este formulario.

### Fuera de alcance

El editor post-creación ("Copiar enlace" / "Enlace de reunión") no cambia — sigue disponible
para pegar o corregir el enlace después de creada la reunión.

---

## 4. Tablero de proyectos por fase

### Ubicación

Dentro de `/os/proyectos`, con un alternador **Tabla / Tablero** junto al encabezado — mismo
patrón que ya usa `/os/oportunidades` (`opportunity-board.tsx`). No se agrega nada al menú
lateral.

### Modelo de datos

Nueva columna `current_phase_id` (uuid, nullable, `references project_phases.id`, `on delete
set null`) en `projects`. Se fija a la fase de `order = 0` en el mismo momento en que
`convertOpportunityToProject` crea las 9 fases del proyecto — un proyecto nunca nace sin fase
actual.

Las fases (`project_phases`) siguen sin tener estado propio: `current_phase_id` vive en
`projects`, no en la fase. Esto es deliberado — la fase "actual" es una propiedad del proyecto
(en qué punto están ahora), mientras que el avance por fase (`computePhaseProgress`) sigue
calculándose de las tareas completadas, sin relación con esta columna. Son dos señales distintas
que ya coexistían conceptualmente: una la deciden los fundadores a mano, la otra la calcula el
sistema. No se fusionan.

### Interacción

- **Escritorio:** arrastrar la tarjeta de una columna (fase) a otra, igual que ya funciona el
  Planner de tareas dentro de un proyecto (`planner.tsx`, drag nativo `draggable`/`onDrop`).
- **Móvil:** cada tarjeta trae un `<select>` con las 9 fases, mismo patrón de *fallback* que ya
  usa el Planner de tareas en pantallas chicas.
- Movimiento **libre**: cualquier fase a cualquier fase, sin máquina de estados. No es una
  garantía de proceso — es una foto de dónde dicen los fundadores que está cada proyecto.
- Nueva Server Action `moveProjectPhaseAction(projectId, phaseId)`: valida que `phaseId`
  pertenezca a `project_phases` del `projectId` dado, actualiza `current_phase_id`, revalida
  `/os/proyectos`. Se protege con la acción `project.update` que ya existe en la matriz de
  permisos (`src/domain/permissions.ts`) — alcance `member` para Project Manager (debe ser
  miembro del proyecto) y `all` para Founder Admin. No se inventa un permiso nuevo.

### Alcance del tablero

Solo proyectos con `status = 'activo'` (los archivados quedan visibles únicamente en la vista de
Tabla, igual que hoy). 9 columnas fijas, en el orden de `phases.ts` (Calificación y preparación →
… → Seguimiento postentrega).

### Contenido de cada tarjeta

Nombre del proyecto, cliente, indicador de salud (`sano`/`en_riesgo`/`crítico`, mismos colores que
ya usa el resto del portal), % de avance (`calculateProgress`, el mismo cálculo existente por
tareas), fecha objetivo (`targetDate`). Clic en la tarjeta navega a `/os/proyectos/[id]`.

### "No acuerdo" como indicador

No se duplica en este tablero. La columna `no_aceptado` que ya existe en el Kanban de
Oportunidades cubre esta necesidad — este tablero nuevo empieza en "proyecto ganado" y no
antes, exactamente como hoy no existe forma de crear un proyecto sin pasar primero por una
oportunidad ganada.

---

## 5. Pruebas

- **Bug de agenda:** test de integración/componente que envía el formulario con un campo
  inválido y verifica que los demás campos retengan su valor en el HTML resultante.
- **Enlace de Meet:** test unitario del schema (URL inválida rechazada, vacío aceptado) + test de
  la Server Action verificando que un proyecto creado con enlace pegado no dispare
  `getCalendarProvider()`.
- **Tablero de fases:** test unitario de `moveProjectPhaseAction` (rechaza `phaseId` de otro
  proyecto, respeta el permiso existente) + test de que la conversión de oportunidad a proyecto
  siempre deja `current_phase_id` en la fase de orden 0.
- Se mantiene la disciplina ya usada en todo el proyecto: `pnpm typecheck && pnpm lint && pnpm
  test` (+ integración cuando el pool de Supabase lo permita) antes de cada commit.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| El remount por `key` en el formulario de reunión pierde el foco del campo mientras se escribe | Solo remonta tras una respuesta de la Server Action (nunca mientras se tipea), foco no se pierde durante la edición normal |
| Migración de `current_phase_id` en proyectos ya existentes sin fase actual | *Backfill* en la misma migración: fija cada proyecto activo a su fase de menor `order` |
| Confundir "fase actual" (manual) con "avance por fase" (calculado) en la UI | Ambas señales se muestran en lugares distintos del detalle del proyecto, con etiquetas claras; no se combinan en un solo número |
