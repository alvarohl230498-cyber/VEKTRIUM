# Tablero de fases y correcciones de agenda — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir el formulario de "Nueva reunión" (pierde datos al fallar validación, no acepta un enlace real de Meet al crear) y agregar un tablero de arrastrar-y-soltar en `/os/proyectos` para mover cada proyecto entre las 9 fases VEKTRIUM.

**Architecture:** Sin subsistemas nuevos. Extiende patrones ya existentes en el repo: `useActionState` con estado que se hace eco de los valores enviados (patrón nuevo, aplicado solo a `MeetingActionState`), una nueva columna `current_phase_id` en `projects` movida a mano vía Server Action (mismo patrón que `moveTaskAction`/`Planner` ya usa para tareas), y un tablero cliente con alternador Tabla/Tablero (mismo patrón que `OpportunityBoard`).

**Tech Stack:** Next.js 16 (App Router, Server Actions), Drizzle ORM + Postgres (Supabase), Zod, Vitest, Tailwind v4.

## Global Constraints

- Node 22 requerido para `pnpm test`/`pnpm build`/`pnpm typecheck` en este entorno — el `node` del PATH por defecto es v18.17.0 (insuficiente). Prependear `/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation` al `PATH` antes de cualquier comando pnpm, o usar `fnm exec --using=22 -- <comando>`.
- Un módulo con la directiva `'use server'` (`src/app/os/agenda/actions.ts`, `src/app/os/proyectos/actions.ts`) solo puede exportar funciones `async`. No exportar helpers síncronos ni constantes desde ahí.
- Las políticas RLS de Supabase son a nivel de fila, no de columna: `projects_update` (definida en `supabase/migrations/0002_rls_completo.sql:131-133`) ya cubre cualquier columna nueva en `projects`, incluida `current_phase_id`. No se necesita una política RLS nueva.
- Las migraciones de este repo son archivos SQL escritos a mano y numerados secuencialmente en `supabase/migrations/` (no se usa `drizzle-kit generate`). Seguir el mismo estilo que `0004_projects_is_illustrative.sql` y `0005_meetings_notes.sql`.
- Todo texto de interfaz va en español, siguiendo el tono ya usado en el portal (directo, sin tecnicismos).
- Antes de cada commit: `pnpm typecheck && pnpm lint && pnpm test` en verde (con Node 22 en el PATH). `pnpm test:integration` requiere Supabase real — puede fallar por agotamiento del pool de conexiones (`EMAXCONNSESSION`, límite 15) de forma intermitente y no relacionada con el código; si falla por eso, no es bloqueante, pero debe volver a intentarse antes de dar la tarea por terminada.
- `Project` (en `src/data/types.ts`) es la forma que consume toda la UI; `ProjectRow` (`schema.projects.$inferSelect`) es la fila de Postgres. Todo cambio de columna pasa por: schema Drizzle → migración SQL → `src/data/types.ts` → `src/data/supabase/mappers.ts` → (si aplica) `src/data/memory/store.ts` + `seed.ts`.

---

## Task 1: Esquema de reunión — enlace de Meet reemplaza el checkbox simulado

**Files:**
- Modify: `src/lib/schemas/meeting.ts`
- Create: `tests/unit/meeting-schema.test.ts`

**Interfaces:**
- Produces: `MEET_URL_MESSAGE: string` (constante exportada), `meetingFormSchema` con un campo `meetUrl: string` (vacío o URL válida) en vez de `createMeet: string`. `MeetingFormValues` (tipo inferido) ya no tiene `createMeet`, tiene `meetUrl: string`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/unit/meeting-schema.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { meetingFormSchema, meetingLinkSchema } from '@/lib/schemas/meeting'

const validBase = {
  clientId: 'client-1',
  projectId: '',
  type: 'contacto_inicial',
  title: 'Reunion de prueba',
  organizerId: 'user-1',
  date: '2026-08-15',
  startTime: '10:00',
  durationMinutes: '30',
  customDurationMinutes: '',
  attendeeKeys: [] as string[],
  agenda: 'Agenda de prueba con suficientes caracteres.',
  requestId: 'req-1',
  confirmConflict: '',
}

describe('meetingFormSchema — meetUrl', () => {
  it('acepta el campo vacio (sin enlace)', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: '' })
    expect(result.success).toBe(true)
  })

  it('acepta una URL valida', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'https://meet.google.com/abc-defg-hij' })
    expect(result.success).toBe(true)
  })

  it('rechaza un texto que no es una URL', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'no es un enlace' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'meetUrl')
      expect(issue?.message).toBe('Pega un enlace valido, por ejemplo https://meet.google.com/abc-defg-hij')
    }
  })

  it('ya no acepta createMeet: el campo no existe en el esquema', () => {
    const parsed = meetingFormSchema.parse({ ...validBase, meetUrl: '' })
    expect(parsed).not.toHaveProperty('createMeet')
  })
})

describe('meetingLinkSchema comparte el mismo mensaje de error', () => {
  it('usa el mismo texto que meetingFormSchema para una URL invalida', () => {
    const linkResult = meetingLinkSchema.safeParse({ meetingId: 'm-1', meetUrl: 'no es un enlace' })
    const formResult = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'no es un enlace' })
    const linkMessage = !linkResult.success ? linkResult.error.issues[0]?.message : null
    const formMessage = !formResult.success
      ? formResult.error.issues.find((i) => i.path[0] === 'meetUrl')?.message
      : null
    expect(linkMessage).toBe(formMessage)
  })
})
```

- [ ] **Step 2: Correr el test y confirmar que falla**

Con Node 22 en el PATH:

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm exec vitest run tests/unit/meeting-schema.test.ts
```

Esperado: falla porque `meetingFormSchema` todavía valida `createMeet`, no `meetUrl` (el campo `meetUrl` no está declarado, así que Zod lo ignora silenciosamente y las aserciones de mensaje fallan).

- [ ] **Step 3: Editar el esquema**

En `src/lib/schemas/meeting.ts`, reemplazar el contenido completo del archivo por:

```typescript
import { z } from 'zod'
import { MEETING_TYPES } from '@/data/types'

export const MEET_URL_MESSAGE = 'Pega un enlace valido, por ejemplo https://meet.google.com/abc-defg-hij'

/**
 * Un unico esquema Zod importado tanto por el formulario cliente
 * (src/app/os/agenda/meeting-form.tsx) como por el Server Action
 * (src/app/os/agenda/actions.ts). No pueden desincronizarse porque son
 * literalmente el mismo objeto.
 */
export const meetingFormSchema = z
  .object({
    clientId: z.string().min(1, 'Selecciona un cliente.'),
    projectId: z.string(),
    type: z.enum(MEETING_TYPES, 'Selecciona un tipo de reunión válido.'),
    title: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(140, 'El título no puede superar 140 caracteres.'),
    organizerId: z.string().min(1, 'Selecciona un organizador.'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Selecciona una hora válida.'),
    durationMinutes: z.string().min(1, 'Selecciona una duración.'),
    customDurationMinutes: z.string(),
    attendeeKeys: z.array(z.string()),
    agenda: z
      .string()
      .trim()
      .min(10, 'Describe la agenda u objetivos (mínimo 10 caracteres).')
      .max(2000, 'La agenda no puede superar 2000 caracteres.'),
    /**
     * Enlace real de Meet pegado al crear la reunion (opcional). Vacio ->
     * la reunion se guarda sin enlace, se puede pegar despues con el editor
     * "Enlace de reunion" que ya existe en cada tarjeta. Ya no hay opcion de
     * generar un enlace "simulado": esa via (checkbox + MockCalendarProvider)
     * se elimino del formulario de creacion.
     */
    meetUrl: z
      .string()
      .trim()
      .refine((value) => value === '' || z.url().safeParse(value).success, { message: MEET_URL_MESSAGE }),
    requestId: z.string().min(1, 'Falta el identificador de solicitud.'),
    confirmConflict: z.string(),
  })
  .check((ctx) => {
    const { durationMinutes, customDurationMinutes } = ctx.value
    if (durationMinutes !== 'custom') return

    const parsed = Number(customDurationMinutes)
    if (!customDurationMinutes || !Number.isFinite(parsed) || parsed < 5 || parsed > 480) {
      ctx.issues.push({
        code: 'custom',
        message: 'Indica una duración personalizada entre 5 y 480 minutos.',
        path: ['customDurationMinutes'],
        input: ctx.value,
      })
    }
  })

export type MeetingFormValues = z.infer<typeof meetingFormSchema>

/**
 * Enlace de Meet pegado a mano: el fundador programa la reunion en su propio
 * Google Calendar (fuera de VEKTRIUM, sin credenciales conectadas) y pega
 * aqui el enlace real para tenerlo a mano y copiarlo rapido para el cliente.
 * Usado tanto para el editor post-creacion (updateMeetingLinkAction) como,
 * indirectamente via MEET_URL_MESSAGE, para el campo de la creacion.
 */
export const meetingLinkSchema = z.object({
  meetingId: z.string().min(1),
  meetUrl: z.url(MEET_URL_MESSAGE),
})

export const meetingNotesSchema = z.object({
  meetingId: z.string().min(1),
  notes: z.string().trim().max(4000, 'Las notas no pueden superar 4000 caracteres.'),
})

/** Minutos efectivos de la reunion a partir de los campos validados del formulario. */
export function resolveDurationMinutes(values: Pick<MeetingFormValues, 'durationMinutes' | 'customDurationMinutes'>): number {
  if (values.durationMinutes === 'custom') return Number(values.customDurationMinutes)
  return Number(values.durationMinutes)
}
```

- [ ] **Step 4: Correr el test y confirmar que pasa**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm exec vitest run tests/unit/meeting-schema.test.ts
```

Esperado: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/meeting.ts tests/unit/meeting-schema.test.ts
git commit -m "feat: reemplazar el checkbox de Meet simulado por un campo de enlace real"
```

---

## Task 2: Server Action de reuniones — recordar lo escrito y usar el enlace pegado

**Files:**
- Modify: `src/app/os/agenda/action-state.ts`
- Modify: `src/app/os/agenda/actions.ts`

**Interfaces:**
- Consumes: `meetingFormSchema`, `MEET_URL_MESSAGE` de Task 1.
- Produces: `MeetingActionState` con dos campos nuevos: `values: Record<string, string | string[]>`, `submissionId: number`. `createMeetingAction` deja de invocar `getCalendarProvider()`.

- [ ] **Step 1: Editar `action-state.ts`**

Reemplazar el contenido completo de `src/app/os/agenda/action-state.ts` por:

```typescript
/**
 * Tipos y valores iniciales del estado de los Server Actions de Agenda,
 * separados de actions.ts a proposito: un modulo con la directiva
 * 'use server' solo puede exportar funciones async — exportar tambien una
 * constante (como el estado inicial) desde ahi produce `undefined` en el
 * cliente en tiempo de ejecucion, no un error de build.
 */

export interface ConflictSummary {
  id: string
  title: string
  startsAt: string
  endsAt: string
}

export interface MeetingActionState {
  status: 'idle' | 'error' | 'conflict' | 'success'
  fieldErrors: Record<string, string>
  formError: string | null
  conflicts: ConflictSummary[]
  meetingId: string | null
  /**
   * Ultimo valor enviado por cada campo del formulario (texto o array para
   * attendeeKeys). Se usa para volver a llenar el formulario cuando falla
   * la validacion: sin esto, React 19 limpia todo input no controlado antes
   * de correr la Server Action (ver meeting-form.tsx), y no habria con que
   * reponer lo que el usuario ya habia escrito.
   */
  values: Record<string, string | string[]>
  /**
   * Contador que sube en cada intento de envio (exito o fallo). meeting-form.tsx
   * lo usa como `key` del <form> para forzar un remontaje: `defaultValue` de
   * React solo se aplica en el montaje inicial, asi que sin un remontaje los
   * campos no controlados no recuperarian `values` aunque el estado ya lo tenga.
   */
  submissionId: number
}

export const initialMeetingActionState: MeetingActionState = {
  status: 'idle',
  fieldErrors: {},
  formError: null,
  conflicts: [],
  meetingId: null,
  values: {},
  submissionId: 0,
}

/** Estado de las ediciones puntuales (enlace de Meet, notas) — sin campos por formulario. */
export interface SimpleActionState {
  status: 'idle' | 'error' | 'success'
  error: string | null
}

export const initialSimpleActionState: SimpleActionState = {
  status: 'idle',
  error: null,
}
```

- [ ] **Step 2: Editar `actions.ts`**

En `src/app/os/agenda/actions.ts`, aplicar estos cambios:

1) Quitar el import de `getCalendarProvider` (ya no se usa en este archivo tras el paso 4) y quitar `MeetingSyncStatus` del import de tipos si deja de usarse ahí — **no**, `MeetingSyncStatus` se sigue usando como tipo de `syncStatus` más abajo, se mantiene. `getCalendarProvider` sigue usándose en `retryMeetingSyncAction` (línea 213 original) — **no se quita el import**, solo se quita la llamada dentro de `createMeetingAction`.

2) Reemplazar la función `fail` (líneas 18-20 originales) por:

```typescript
function fail(
  prevSubmissionId: number,
  values: Record<string, string | string[]>,
  fieldErrors: Record<string, string>,
  formError: string,
): MeetingActionState {
  return {
    ...initialMeetingActionState,
    status: 'error',
    fieldErrors,
    formError,
    values,
    submissionId: prevSubmissionId + 1,
  }
}
```

3) Reemplazar el cuerpo completo de `createMeetingAction` (desde `export async function createMeetingAction` hasta su `}` de cierre) por:

```typescript
export async function createMeetingAction(
  prevState: MeetingActionState,
  formData: FormData,
): Promise<MeetingActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'meeting.create' }) === 'none') {
    return {
      ...initialMeetingActionState,
      status: 'error',
      formError: 'No tienes permiso para crear reuniones.',
      submissionId: prevState.submissionId + 1,
    }
  }

  const raw: Record<string, string | string[]> = {
    clientId: String(formData.get('clientId') ?? ''),
    projectId: String(formData.get('projectId') ?? ''),
    type: String(formData.get('type') ?? ''),
    title: String(formData.get('title') ?? ''),
    organizerId: String(formData.get('organizerId') ?? ''),
    date: String(formData.get('date') ?? ''),
    startTime: String(formData.get('startTime') ?? ''),
    durationMinutes: String(formData.get('durationMinutes') ?? ''),
    customDurationMinutes: String(formData.get('customDurationMinutes') ?? ''),
    attendeeKeys: formData.getAll('attendeeKeys').map(String),
    agenda: String(formData.get('agenda') ?? ''),
    meetUrl: String(formData.get('meetUrl') ?? ''),
    requestId: String(formData.get('requestId') ?? ''),
    confirmConflict: String(formData.get('confirmConflict') ?? ''),
  }

  const parsed = meetingFormSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return fail(prevState.submissionId, raw, fieldErrors, 'Revisa los campos marcados en rojo.')
  }

  const values = parsed.data
  const repository = getRepository(session.user.id)

  const [client, projects, users] = await Promise.all([
    repository.getClientById(values.clientId),
    repository.listProjects(),
    repository.listUsers(),
  ])

  if (!client) {
    return fail(prevState.submissionId, raw, { clientId: 'Selecciona un cliente valido.' }, 'Revisa los campos marcados en rojo.')
  }

  if (values.projectId) {
    const project = projects.find((p) => p.id === values.projectId)
    if (!project || project.clientId !== values.clientId) {
      return fail(
        prevState.submissionId,
        raw,
        { projectId: 'Ese proyecto no pertenece al cliente seleccionado.' },
        'Revisa los campos marcados en rojo.',
      )
    }
  }

  const organizer = users.find((u) => u.id === values.organizerId)
  if (!organizer) {
    return fail(prevState.submissionId, raw, { organizerId: 'Selecciona un organizador valido.' }, 'Revisa los campos marcados en rojo.')
  }

  const durationMinutes = resolveDurationMinutes(values)
  const startsAt = buildLimaIso(values.date, values.startTime)
  const endsAt = addMinutesIso(startsAt, durationMinutes)

  if (Number.isNaN(new Date(startsAt).getTime())) {
    return fail(prevState.submissionId, raw, { date: 'La combinacion de fecha y hora no es valida.' }, 'Revisa los campos marcados en rojo.')
  }

  const existingMeetings = await repository.listMeetings()
  const conflicts = findSchedulingConflicts({
    meetings: existingMeetings,
    organizerId: values.organizerId,
    startsAt,
    endsAt,
  })

  if (conflicts.length > 0 && values.confirmConflict !== 'true') {
    return {
      ...initialMeetingActionState,
      status: 'conflict',
      conflicts: conflicts.map((m) => ({ id: m.id, title: m.title, startsAt: m.startsAt, endsAt: m.endsAt })),
      values: raw,
      submissionId: prevState.submissionId + 1,
    }
  }

  const contactsByClient = await repository.listContactsByClient(values.clientId)
  const attendees: MeetingAttendee[] = [
    {
      userId: organizer.id,
      contactId: null,
      email: organizer.email,
      fullName: organizer.fullName,
      response: 'aceptado',
    },
  ]

  for (const key of values.attendeeKeys) {
    const [kind, id] = key.split(':')
    if (kind === 'user' && id && id !== organizer.id) {
      const user = users.find((u) => u.id === id)
      if (user) {
        attendees.push({ userId: user.id, contactId: null, email: user.email, fullName: user.fullName, response: 'pendiente' })
      }
    } else if (kind === 'contact' && id) {
      const contact = contactsByClient.find((c) => c.id === id)
      if (contact) {
        attendees.push({ userId: null, contactId: contact.id, email: contact.email, fullName: contact.fullName, response: 'pendiente' })
      }
    }
  }

  // El enlace de Meet ya no lo genera VEKTRIUM (no hay credenciales de Google
  // conectadas): si el usuario pego uno real al crear la reunion se guarda
  // tal cual; si no, queda null y se puede pegar despues desde la tarjeta.
  const meetUrl = values.meetUrl || null
  const isMock = false
  const providerEventId: string | null = null
  const syncStatus: MeetingSyncStatus = 'sincronizada'
  const syncError: string | null = null

  const meeting = await repository.createMeeting({
    clientId: values.clientId,
    projectId: values.projectId || null,
    type: values.type,
    title: values.title,
    agenda: values.agenda,
    startsAt,
    endsAt,
    organizerId: values.organizerId,
    isMock,
    meetUrl,
    providerEventId,
    requestId: values.requestId,
    syncStatus,
    syncError,
    attendees,
    hasMinutes: false,
    notes: null,
  })

  revalidatePath('/os/agenda')
  revalidatePath('/os')

  return {
    ...initialMeetingActionState,
    status: 'success',
    meetingId: meeting.id,
    submissionId: prevState.submissionId + 1,
  }
}
```

Nota: la firma cambia de `_prevState` a `prevState` porque ahora sí se usa (`prevState.submissionId`).

- [ ] **Step 3: Verificar tipos y lint**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint
```

Esperado: sin errores. Si `getCalendarProvider` queda marcado como importado-pero-no-usado por ESLint, es porque `retryMeetingSyncAction` (más abajo en el mismo archivo, sin cambios) todavía lo usa — confirmar que esa función sigue intacta antes de asumir un error real.

- [ ] **Step 4: Commit**

```bash
git add src/app/os/agenda/action-state.ts src/app/os/agenda/actions.ts
git commit -m "feat: recordar los datos de la reunion al fallar validacion y usar el enlace pegado"
```

---

## Task 3: Formulario de reunión — no perder lo escrito, pegar el enlace al crear

**Files:**
- Modify: `src/app/os/agenda/meeting-form.tsx`

**Interfaces:**
- Consumes: `MeetingActionState.values`/`submissionId` de Task 2.

- [ ] **Step 1: Editar `meeting-form.tsx`**

Reemplazar el contenido completo de `src/app/os/agenda/meeting-form.tsx` por:

```tsx
'use client'

import { useEffect, useId, useState } from 'react'
import { useActionState } from 'react'
import type { Client, Contact, Project, User } from '@/data'
import { MEETING_TYPES } from '@/data/types'
import { DURATION_PRESETS_MINUTES, MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { initialMeetingActionState, type MeetingActionState } from './action-state'
import { createMeetingAction } from './actions'

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
      {message}
    </p>
  )
}

/** Lee un campo de texto de `values`, o '' si no vino en el ultimo envio. */
function fieldValue(values: MeetingActionState['values'], key: string): string {
  const value = values[key]
  return typeof value === 'string' ? value : ''
}

/** true si `key` (ej. "user:abc") estaba marcado en el ultimo envio de attendeeKeys. */
function isAttendeeChecked(values: MeetingActionState['values'], key: string): boolean {
  const value = values.attendeeKeys
  return Array.isArray(value) && value.includes(key)
}

export function NewMeetingForm({
  clients,
  projects,
  users,
  contacts,
  requestId,
}: {
  clients: Client[]
  projects: Project[]
  users: User[]
  contacts: Contact[]
  requestId: string
}) {
  const [state, formAction, pending] = useActionState(createMeetingAction, initialMeetingActionState)
  const [clientId, setClientId] = useState(() => fieldValue(state.values, 'clientId') || clients[0]?.id || '')
  const [duration, setDuration] = useState(() => fieldValue(state.values, 'durationMinutes') || '30')
  const formId = useId()

  useEffect(() => {
    // Reconcilia el estado de filtrado (clientId, duration) con lo que el
    // <form> remontado (ver `key` abajo) va a mostrar: sin esto, tras un
    // envio fallido el select de cliente volveria a su defaultValue pero el
    // filtrado de proyectos/contactos seguiria usando el clientId anterior.
    setClientId(fieldValue(state.values, 'clientId') || clients[0]?.id || '')
    setDuration(fieldValue(state.values, 'durationMinutes') || '30')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.submissionId])

  const clientProjects = projects.filter((p) => p.clientId === clientId)
  const clientContacts = contacts.filter((c) => c.clientId === clientId)

  return (
    <section aria-labelledby={`${formId}-heading`} className="border border-vk-line bg-white p-6">
      <h2 id={`${formId}-heading`} className="font-display text-2xl font-extrabold text-vk-navy">
        Nueva reunión
      </h2>
      <p className="mt-1 text-sm leading-6 text-vk-muted">
        Todas las horas se guardan y muestran en zona horaria de Lima (UTC-5).
      </p>

      {state.status === 'success' ? (
        <p role="status" className="mt-4 rounded-md border border-vk-success/30 bg-vk-success/10 px-4 py-3 text-sm font-semibold text-vk-success">
          Reunión guardada correctamente.
        </p>
      ) : null}

      {state.formError ? (
        <p role="alert" className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}

      {state.status === 'conflict' ? (
        <div role="alert" className="mt-4 rounded-md border border-vk-warning/30 bg-vk-warning/10 px-4 py-3 text-sm text-vk-navy">
          <p className="font-extrabold text-vk-warning">Conflicto de horario</p>
          <p className="mt-1 leading-6">
            El organizador elegido ya tiene {state.conflicts.length === 1 ? 'una reunión' : 'reuniones'} en ese
            horario. Puedes guardar de todas formas si es intencional.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.conflicts.map((c) => (
              <li key={c.id}>
                {c.title} · {formatLimaTime(new Date(c.startsAt))}–{formatLimaTime(new Date(c.endsAt))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        key={state.submissionId}
        action={formAction}
        noValidate
        className="mt-6 grid gap-5 sm:grid-cols-2"
      >
        <input type="hidden" name="requestId" defaultValue={requestId} />

        <div>
          <label htmlFor={`${formId}-clientId`} className="text-sm font-bold text-vk-navy">
            Cliente <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-clientId`}
            name="clientId"
            required
            defaultValue={fieldValue(state.values, 'clientId') || clients[0]?.id || ''}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {clients.length === 0 ? <option value="">No hay clientes registrados</option> : null}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradeName ?? c.legalName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.clientId} />
        </div>

        <div>
          <label htmlFor={`${formId}-projectId`} className="text-sm font-bold text-vk-navy">
            Proyecto (opcional)
          </label>
          <select
            id={`${formId}-projectId`}
            name="projectId"
            defaultValue={fieldValue(state.values, 'projectId')}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            <option value="">Sin proyecto vinculado</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.projectId} />
        </div>

        <div>
          <label htmlFor={`${formId}-type`} className="text-sm font-bold text-vk-navy">
            Tipo de reunión <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-type`}
            name="type"
            required
            defaultValue={fieldValue(state.values, 'type') || MEETING_TYPES[0]}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {MEETING_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.type} />
        </div>

        <div>
          <label htmlFor={`${formId}-title`} className="text-sm font-bold text-vk-navy">
            Título <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            required
            maxLength={140}
            defaultValue={fieldValue(state.values, 'title')}
            placeholder="Ej. Levantamiento de proceso de facturación"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.title} />
        </div>

        <div>
          <label htmlFor={`${formId}-organizerId`} className="text-sm font-bold text-vk-navy">
            Organizador <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-organizerId`}
            name="organizerId"
            required
            defaultValue={fieldValue(state.values, 'organizerId') || users[0]?.id || ''}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.organizerId} />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:col-span-1">
          <div className="col-span-2">
            <label htmlFor={`${formId}-date`} className="text-sm font-bold text-vk-navy">
              Fecha <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-date`}
              name="date"
              type="date"
              required
              defaultValue={fieldValue(state.values, 'date')}
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.date} />
          </div>
          <div>
            <label htmlFor={`${formId}-startTime`} className="text-sm font-bold text-vk-navy">
              Hora <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-startTime`}
              name="startTime"
              type="time"
              required
              defaultValue={fieldValue(state.values, 'startTime')}
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.startTime} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <span className="text-sm font-bold text-vk-navy">Duración</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <select
              aria-label="Duración de la reunión"
              name="durationMinutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            >
              {DURATION_PRESETS_MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
              <option value="custom">Personalizada</option>
            </select>
            {duration === 'custom' ? (
              <div>
                <label htmlFor={`${formId}-customDuration`} className="sr-only">
                  Duración personalizada en minutos
                </label>
                <input
                  id={`${formId}-customDuration`}
                  name="customDurationMinutes"
                  type="number"
                  min={5}
                  max={480}
                  defaultValue={fieldValue(state.values, 'customDurationMinutes')}
                  placeholder="Minutos"
                  className="w-28 rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
                />
              </div>
            ) : (
              <input type="hidden" name="customDurationMinutes" value="" />
            )}
          </div>
          <FieldError message={state.fieldErrors.customDurationMinutes} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-bold text-vk-navy">Asistentes</legend>
          <p className="text-xs text-vk-muted">El organizador se agrega automáticamente.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Equipo VEKTRIUM</p>
              {users.map((u) => (
                <label key={u.id} className="mt-1 flex items-center gap-2 text-sm text-vk-ink">
                  <input
                    type="checkbox"
                    name="attendeeKeys"
                    value={`user:${u.id}`}
                    defaultChecked={isAttendeeChecked(state.values, `user:${u.id}`)}
                    className="h-4 w-4"
                  />
                  {u.fullName}
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Contactos del cliente</p>
              {clientContacts.length === 0 ? (
                <p className="mt-1 text-xs text-vk-muted">Este cliente no tiene contactos registrados.</p>
              ) : (
                clientContacts.map((c) => (
                  <label key={c.id} className="mt-1 flex items-center gap-2 text-sm text-vk-ink">
                    <input
                      type="checkbox"
                      name="attendeeKeys"
                      value={`contact:${c.id}`}
                      defaultChecked={isAttendeeChecked(state.values, `contact:${c.id}`)}
                      className="h-4 w-4"
                    />
                    {c.fullName}
                  </label>
                ))
              )}
            </div>
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-agenda`} className="text-sm font-bold text-vk-navy">
            Agenda / objetivos <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-agenda`}
            name="agenda"
            required
            rows={3}
            maxLength={2000}
            defaultValue={fieldValue(state.values, 'agenda')}
            placeholder="¿Qué se espera lograr en esta reunión?"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.agenda} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-meetUrl`} className="text-sm font-bold text-vk-navy">
            Enlace de Meet (opcional)
          </label>
          <input
            id={`${formId}-meetUrl`}
            name="meetUrl"
            type="url"
            defaultValue={fieldValue(state.values, 'meetUrl')}
            placeholder="https://meet.google.com/abc-defg-hij"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <p className="mt-1 text-xs text-vk-muted">
            Pégalo si ya lo creaste en Google Meet. Si lo dejas vacío, puedes agregarlo después desde la tarjeta de
            la reunión.
          </p>
          <FieldError message={state.fieldErrors.meetUrl} />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-vk-cobalt px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar reunión'}
          </button>
          {state.status === 'conflict' ? (
            <button
              type="submit"
              name="confirmConflict"
              value="true"
              disabled={pending}
              className="rounded-md border border-vk-warning px-5 py-2.5 text-sm font-extrabold text-vk-warning transition hover:bg-vk-warning/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar de todas formas
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
```

Cambios clave respecto al original: se quitó el bloque del checkbox `createMeet` y se agregó el campo `meetUrl`; cada input no controlado ahora tiene `defaultValue={fieldValue(state.values, '<campo>')}` (o `defaultChecked` para los checkboxes de asistentes); el `<form>` tiene `key={state.submissionId}`; se agregó el `useEffect` que reconcilia `clientId`/`duration`; se quitaron `formRef` y el `useEffect` anterior que llamaba a `formRef.current?.reset()` en éxito — ya no cumplen ninguna función porque el remontaje por `key` limpia el formulario solo (con `values: {}` en el estado de éxito).

- [ ] **Step 2: Verificar tipos y lint**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint
```

- [ ] **Step 3: Verificación manual en el navegador**

No hay infraestructura de test de componentes en este repo (Vitest corre en `environment: 'node'`, sin jsdom/Testing Library) — se verifica con el servidor de desarrollo real, igual que las funcionalidades previas de esta sesión (enlace de Meet, notas de reunión):

1. Iniciar el servidor de desarrollo (Node 22) y entrar a `/os/agenda`.
2. Llenar el formulario "Nueva reunión" con cliente, título, organizador, fecha, hora, asistentes marcados — pero dejar "Agenda / objetivos" con menos de 10 caracteres.
3. Enviar. Confirmar que: aparece el mensaje "Revisa los campos marcados en rojo", el mensaje puntual bajo "Agenda / objetivos", y **todos los demás campos siguen mostrando lo que se escribió** (cliente, título, organizador, fecha, hora, asistentes marcados, duración si se eligió "Personalizada").
4. Completar la agenda y agregar un enlace en "Enlace de Meet" (ej. `https://meet.google.com/abc-defg-hij`). Enviar.
5. Confirmar "Reunión guardada correctamente", el formulario vuelve a estar vacío, y la reunión aparece en la lista con ese enlace de Meet real (sin insignia SIMULADO) — el botón "Copiar enlace" debe copiar exactamente esa URL.

- [ ] **Step 4: Commit**

```bash
git add src/app/os/agenda/meeting-form.tsx
git commit -m "feat: el formulario de reunion ya no pierde lo escrito y acepta un enlace real de Meet"
```

---

## Task 4: Columna `current_phase_id` en proyectos

**Files:**
- Modify: `src/db/schema/projects.ts`
- Create: `supabase/migrations/0006_project_current_phase.sql`
- Modify: `src/data/types.ts`
- Modify: `src/data/supabase/mappers.ts`
- Create: `scripts/apply-sql.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `Project.currentPhaseId: string | null` (en `src/data/types.ts`), `schema.projects.currentPhaseId` (Drizzle), `mapProject()` incluye `currentPhaseId`.

- [ ] **Step 1: Editar el esquema Drizzle**

En `src/db/schema/projects.ts`, dentro del objeto de columnas de `projects` (la llamada a `pgTable('projects', { ... }, ...)`), agregar la columna `currentPhaseId` justo después de `progressCached` y antes de `isIllustrative`:

```typescript
    // Cache derivado, ver domain/progress.ts. La fuente de verdad es el calculo, no esta columna.
    progressCached: numeric('progress_cached').notNull().default('0'),
    /**
     * Fase "actual" del tablero de proyectos (/os/proyectos, vista Tablero):
     * la fija a mano el equipo, sin relacion con el avance calculado de las
     * tareas (esa es una senal distinta, ver "Avance por fase"). Nullable
     * solo por seguridad referencial (ON DELETE SET NULL); en la practica
     * todo proyecto la tiene desde que se crea (ver convertOpportunityToProject).
     */
    currentPhaseId: uuid('current_phase_id').references((): AnyPgColumn => projectPhases.id, { onDelete: 'set null' }),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
```

Agregar `AnyPgColumn` al import de `drizzle-orm/pg-core` en la parte superior del archivo (se necesita para anotar el tipo de retorno del callback y romper el ciclo de tipos entre `projects` y `projectPhases`, declaradas en el mismo archivo):

```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  pgEnum,
  boolean,
  numeric,
  integer,
  index,
  unique,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
```

Y agregar el índice correspondiente en el array de índices de `projects` (mismo array donde están `projects_client_id_idx` etc.):

```typescript
    index('projects_current_phase_id_idx').on(t.currentPhaseId),
```

- [ ] **Step 2: Escribir la migración SQL**

Crear `supabase/migrations/0006_project_current_phase.sql`:

```sql
-- Fase "actual" de cada proyecto para el tablero de /os/proyectos (vista
-- Tablero): el equipo la mueve a mano, sin relacion con el avance calculado
-- por tareas. Backfill: cada proyecto existente queda en su fase de menor
-- order (todo proyecto ya tiene sus 9 fases desde que se creo).
alter table projects add column current_phase_id uuid references project_phases(id) on delete set null;

create index projects_current_phase_id_idx on projects (current_phase_id);

update projects p
set current_phase_id = (
  select pp.id from project_phases pp
  where pp.project_id = p.id
  order by pp.order asc
  limit 1
)
where p.current_phase_id is null;
```

- [ ] **Step 3: Crear el script para aplicar migraciones sueltas**

Crear `scripts/apply-sql.ts`:

```typescript
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

/**
 * Aplica un archivo .sql de supabase/migrations/ directamente contra
 * DATABASE_URL, fuera de drizzle-kit (las migraciones de este repo se
 * escriben a mano, ver AGENTS.md). Mismo patron de carga de .env que
 * scripts/seed-founders.ts: no hay dotenv instalado, se parsea a mano y no
 * se sobreescribe lo que ya este en el entorno del proceso.
 *
 * Uso: pnpm db:apply supabase/migrations/0006_project_current_phase.sql
 */
function loadEnv(): void {
  let text: string
  try {
    text = readFileSync('.env', 'utf8')
  } catch {
    return
  }
  for (const line of text.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    const key = match?.[1]
    const value = match?.[2]
    if (key && value !== undefined && !(key in process.env)) process.env[key] = value
  }
}

async function main() {
  loadEnv()
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Uso: pnpm db:apply <ruta-al-archivo.sql>')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Falta DATABASE_URL en el entorno o en .env.')
    process.exit(1)
  }

  const sql = postgres(databaseUrl, { max: 1 })
  try {
    const migration = readFileSync(filePath, 'utf8')
    await sql.unsafe(migration)
    console.log(`Aplicado: ${filePath}`)
  } finally {
    await sql.end()
  }
}

void main()
```

En `package.json`, agregar el script (junto a `"seed:founders"`):

```json
    "db:apply": "node --conditions=react-server --import tsx scripts/apply-sql.ts"
```

- [ ] **Step 4: Aplicar la migración contra Supabase**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm db:apply supabase/migrations/0006_project_current_phase.sql
```

Esperado: `Aplicado: supabase/migrations/0006_project_current_phase.sql`. Esto verifica indirectamente el esquema; la verificación funcional (que `current_phase_id` se lee/escribe bien) llega con el test de integración de Task 5.

- [ ] **Step 5: Editar `src/data/types.ts`**

En la interfaz `Project`, agregar el campo después de `targetDate`:

```typescript
export interface Project extends Illustrative {
  id: string
  code: string
  clientId: string
  opportunityId: string | null
  name: string
  status: ProjectStatus
  health: ProjectHealth
  healthReason: string | null
  ownerId: string
  startDate: string
  targetDate: string
  /** Fase actual en el tablero de /os/proyectos. Ver comentario en el esquema Drizzle. */
  currentPhaseId: string | null
  archivedAt: string | null
}
```

- [ ] **Step 6: Editar `src/data/supabase/mappers.ts`**

En `mapProject`, agregar el campo:

```typescript
export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    clientId: row.clientId,
    opportunityId: row.opportunityId,
    name: row.name,
    status: row.status,
    health: row.health,
    healthReason: row.healthReason,
    ownerId: row.ownerId,
    startDate: toDateOnly(row.startDate),
    targetDate: toDateOnly(row.targetDate),
    currentPhaseId: row.currentPhaseId,
    archivedAt: toIsoOrNull(row.archivedAt),
    ...illustrativeFlag(row.isIllustrative),
  }
}
```

- [ ] **Step 7: Verificar tipos**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck
```

Esperado: falla en `src/data/memory/seed.ts` y `src/data/memory/store.ts` (`Project` ahora exige `currentPhaseId` y esos literales no lo tienen) — se corrige en Task 5. Confirmar que el único error nuevo es exactamente ese (propiedad `currentPhaseId` faltante en los literales `Project` de memory/).

- [ ] **Step 8: Commit**

```bash
git add src/db/schema/projects.ts supabase/migrations/0006_project_current_phase.sql src/data/types.ts src/data/supabase/mappers.ts scripts/apply-sql.ts package.json
git commit -m "feat: agregar current_phase_id a projects para el tablero por fase"
```

(El typecheck queda en rojo hasta Task 5 — es esperado, ambas tareas son parte del mismo cambio de tipo. No hacer `pnpm test` todavía.)

---

## Task 5: Repositorio — mover la fase actual de un proyecto

**Files:**
- Modify: `src/data/repository.ts`
- Modify: `src/data/memory/store.ts`
- Modify: `src/data/memory/seed.ts`
- Modify: `src/data/supabase/store.ts`
- Modify: `tests/integration/supabase-repository.test.ts`

**Interfaces:**
- Consumes: `Project.currentPhaseId` (Task 4).
- Produces: `VektriumRepository.moveProjectPhase(projectId: string, phaseId: string): Promise<Project | null>`. `convertOpportunityToProject` (ambas implementaciones) deja `currentPhaseId` en la fase de `order = 0` desde la creación.

- [ ] **Step 1: Extender la interfaz del repositorio**

En `src/data/repository.ts`, agregar al final de la interfaz `VektriumRepository` (después de `moveTask`):

```typescript
  /**
   * Mueve la fase "actual" de un proyecto (tablero de /os/proyectos).
   * Movimiento libre: a diferencia de moveTask, no hay maquina de estados —
   * cualquier fase a cualquier otra, porque refleja lo que el equipo decide
   * a mano, no una garantia de proceso. Devuelve null si el proyecto no
   * existe, o si phaseId no pertenece a las fases de ese proyecto.
   */
  moveProjectPhase(projectId: string, phaseId: string): Promise<Project | null>
```

- [ ] **Step 2: Implementar en el repositorio en memoria**

En `src/data/memory/store.ts`, reemplazar el bloque de `convertOpportunityToProject` (desde `async convertOpportunityToProject(opportunityId, input: ConvertOpportunityInput) {` hasta su `},` de cierre) por:

```typescript
    async convertOpportunityToProject(opportunityId, input: ConvertOpportunityInput) {
      const opportunity = state.opportunities.find((o) => o.id === opportunityId)
      if (!opportunity) return null

      if (opportunity.status !== 'ganado') {
        const result = transitionOpportunity(opportunity.status, 'ganado', {})
        if (!result.ok) return err(result.error)
      }

      const projectId = `project-${randomUUID()}`
      const templates = buildPhasesForProject(projectId)
      const phases: ProjectPhaseWithTasks[] = templates.map((t) => ({
        id: `${projectId}-phase-${t.order}`,
        projectId: t.projectId,
        order: t.order,
        name: t.name,
        description: t.description,
        weight: t.weight,
        plannedStart: null,
        plannedEnd: null,
        tasks: [],
      }))
      const firstPhase = phases.find((p) => p.order === 0)
      if (!firstPhase) throw new Error('La plantilla de fases no genero una fase de orden 0.')

      const project: Project = {
        id: projectId,
        code: nextProjectCode(state.projects),
        clientId: opportunity.clientId,
        opportunityId: opportunity.id,
        name: input.name,
        status: 'activo',
        health: 'sano',
        healthReason: null,
        ownerId: input.ownerId,
        startDate: input.startDate,
        targetDate: input.targetDate,
        currentPhaseId: firstPhase.id,
        archivedAt: null,
      }
      state.projects.push(project)
      state.phases.push(...phases)

      opportunity.status = 'ganado'
      opportunity.updatedAt = new Date().toISOString()

      return ok(projectWithPhases(project))
    },
```

Y agregar el método nuevo justo después de `moveTask` (antes del `}` de cierre del objeto devuelto por `createMemoryRepository`):

```typescript
    async moveProjectPhase(projectId: string, phaseId: string) {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return null

      const belongsToProject = state.phases.some((p) => p.id === phaseId && p.projectId === projectId)
      if (!belongsToProject) return null

      project.currentPhaseId = phaseId
      return clone(project)
    },
```

- [ ] **Step 3: Actualizar los datos semilla**

En `src/data/memory/seed.ts`, agregar `currentPhaseId` a cada objeto de `seedProjects` (los ids de fase siguen el patrón `${projectId}-phase-${order}` usado por `buildMainProjectPhases`/`buildLightPhases`):

```typescript
export const seedProjects: Project[] = [
  {
    id: mainProjectId,
    code: 'VK-0006',
    clientId: 'client-colca',
    opportunityId: 'opp-colca-1',
    name: 'Portal de minutas y tareas',
    status: 'activo',
    health: 'sano',
    healthReason: null,
    ownerId: 'user-juan-diego',
    startDate: offsetDays(-58),
    targetDate: offsetDays(14),
    currentPhaseId: `${mainProjectId}-phase-5`,
    archivedAt: null,
    isIllustrative: true,
  },
  {
    id: 'project-wayra-reportes',
    code: 'VK-0007',
    clientId: 'client-wayra',
    opportunityId: null,
    name: 'Automatizacion de reportes de auditoria',
    status: 'activo',
    health: 'en_riesgo',
    healthReason: 'Sin respuesta del cliente sobre accesos hace mas de una semana.',
    ownerId: 'user-alvaro',
    startDate: offsetDays(-30),
    targetDate: offsetDays(10),
    currentPhaseId: 'project-wayra-reportes-phase-2',
    archivedAt: null,
    isIllustrative: true,
  },
  {
    id: 'project-illary-dashboard',
    code: 'VK-0008',
    clientId: 'client-illary',
    opportunityId: null,
    name: 'Dashboard ejecutivo de ocupacion',
    status: 'activo',
    health: 'critico',
    healthReason: 'Dos tareas criticas vencidas y bloqueadas por falta de datos fuente.',
    ownerId: 'user-juan-diego',
    startDate: offsetDays(-40),
    targetDate: offsetDays(-2),
    currentPhaseId: 'project-illary-dashboard-phase-5',
    archivedAt: null,
    isIllustrative: true,
  },
  {
    id: 'project-nazca-produccion',
    code: 'VK-0009',
    clientId: 'client-nazca',
    opportunityId: null,
    name: 'Reporte automatizado de produccion',
    status: 'activo',
    health: 'sano',
    healthReason: null,
    ownerId: 'user-alvaro',
    startDate: offsetDays(-15),
    targetDate: offsetDays(30),
    currentPhaseId: 'project-nazca-produccion-phase-2',
    archivedAt: null,
    isIllustrative: true,
  },
  {
    id: 'project-sacha-diagnostico',
    code: 'VK-0005',
    clientId: 'client-sacha',
    opportunityId: null,
    name: 'Diagnostico de inventario (piloto)',
    status: 'archivado',
    health: 'sano',
    healthReason: null,
    ownerId: 'user-alvaro',
    startDate: offsetDays(-150),
    targetDate: offsetDays(-100),
    currentPhaseId: 'project-sacha-diagnostico-phase-1',
    archivedAt: offsetDays(-95),
    isIllustrative: true,
  },
]
```

- [ ] **Step 4: Implementar en el repositorio de Supabase**

En `src/data/supabase/store.ts`, dentro de `convertOpportunityToProject`, reemplazar desde la línea que construye `orderedPhases`/`phases` hasta el `return ok(...)` final por:

```typescript
        const orderedPhases = [...phaseRows].sort((a, b) => a.order - b.order)
        const firstPhase = orderedPhases.find((p) => p.order === 0)
        if (!firstPhase) throw new Error('La plantilla de fases no genero una fase de orden 0.')

        const [finalProjectRow] = await db
          .update(schema.projects)
          .set({ currentPhaseId: firstPhase.id })
          .where(eq(schema.projects.id, projectRow.id))
          .returning()
        if (!finalProjectRow) throw new Error('No se pudo fijar la fase actual del proyecto.')

        const phases: ProjectPhaseWithTasks[] = orderedPhases.map((p) => ({ ...mapProjectPhase(p), tasks: [] }))

        return ok({ ...mapProject(finalProjectRow), phases })
      })
    },
```

(El resto de la función, desde el `db.insert(schema.projects)` hasta la construcción de `orderedPhases`, no cambia.)

Y agregar el método `moveProjectPhase` justo después de `moveTask` (antes del `}` de cierre del objeto devuelto por `createSupabaseRepository`):

```typescript
    async moveProjectPhase(projectId, phaseId) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const [phase] = await db
          .select({ id: schema.projectPhases.id })
          .from(schema.projectPhases)
          .where(and(eq(schema.projectPhases.id, phaseId), eq(schema.projectPhases.projectId, projectId)))
        if (!phase) return null

        const [updated] = await db
          .update(schema.projects)
          .set({ currentPhaseId: phaseId, updatedAt: new Date() })
          .where(eq(schema.projects.id, projectId))
          .returning()
        if (!updated) return null
        return mapProject(updated)
      })
    },
```

- [ ] **Step 5: Verificar tipos**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck
```

Esperado: sin errores (el error de Task 4 Step 7 queda resuelto).

- [ ] **Step 6: Test de integración**

En `tests/integration/supabase-repository.test.ts`, agregar dentro del `describe('Supabase repository — oportunidades y conversion a proyecto', ...)`, como último `it` de ese bloque (después de `convertOpportunityToProject crea el proyecto...`):

```typescript
  it('convertOpportunityToProject deja current_phase_id en la fase de orden 0', async () => {
    const withPhases = await repo.getProjectWithPhases(projectId)
    const firstPhase = withPhases?.phases.find((p) => p.order === 0)
    expect(firstPhase).toBeDefined()
    expect(withPhases?.currentPhaseId).toBe(firstPhase?.id)
  })
```

Y agregar un nuevo `describe` después de `describe('Supabase repository — tareas', ...)`:

```typescript
describe('Supabase repository — tablero de fases', () => {
  it('moveProjectPhase mueve el proyecto a otra fase del mismo proyecto', async () => {
    const withPhases = await repo.getProjectWithPhases(projectId)
    const targetPhase = withPhases?.phases.find((p) => p.order === 3)
    if (!targetPhase) throw new Error('El proyecto de prueba deberia tener una fase de orden 3')

    const moved = await repo.moveProjectPhase(projectId, targetPhase.id)
    expect(moved?.currentPhaseId).toBe(targetPhase.id)
  })

  it('moveProjectPhase devuelve null si la fase no pertenece al proyecto', async () => {
    const otherClient = await repo.createClient({
      legalName: 'Otro Cliente Repo Test S.A.C.',
      tradeName: 'Otro Cliente',
      ruc: '20601234598',
      industry: 'Tecnologia',
      size: 'micro',
      city: 'Lima',
      country: 'Peru',
      confidentiality: 'interno',
    })
    const otherOpportunity = await repo.createOpportunity({
      clientId: otherClient.id,
      title: 'Oportunidad ajena de prueba',
      expectedAmount: 500,
      ownerId: OWNER,
    })
    const otherResult = await repo.convertOpportunityToProject(otherOpportunity.id, {
      name: 'Proyecto ajeno de prueba',
      ownerId: OWNER,
      startDate: '2026-08-01',
      targetDate: '2026-12-01',
    })
    if (!otherResult || !otherResult.ok) throw new Error('La conversion del proyecto ajeno debio tener exito')
    const foreignPhaseId = otherResult.value.phases[0]?.id
    if (!foreignPhaseId) throw new Error('El proyecto ajeno deberia tener fases')

    const result = await repo.moveProjectPhase(projectId, foreignPhaseId)
    expect(result).toBeNull()

    await adminSql`delete from project_phases where project_id = ${otherResult.value.id}`
    await adminSql`delete from projects where id = ${otherResult.value.id}`
    await adminSql`delete from opportunities where id = ${otherOpportunity.id}`
    await adminSql`delete from clients where id = ${otherClient.id}`
  })

  it('moveProjectPhase devuelve null si el proyecto no existe', async () => {
    const withPhases = await repo.getProjectWithPhases(projectId)
    const anyPhaseId = withPhases?.phases[0]?.id
    if (!anyPhaseId) throw new Error('El proyecto de prueba deberia tener fases')

    const result = await repo.moveProjectPhase('00000000-0000-4000-9000-000000000000', anyPhaseId)
    expect(result).toBeNull()
  })
})
```

- [ ] **Step 7: Correr la batería completa (unit + integración)**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration
```

Esperado: todo en verde. Si `test:integration` falla por `EMAXCONNSESSION`, es el agotamiento de pool intermitente ya conocido — reintentar antes de continuar; si persiste, dejarlo anotado y seguir (no es un fallo del código nuevo), pero confirmar `pnpm test` (unit) en verde como mínimo.

- [ ] **Step 8: Commit**

```bash
git add src/data/repository.ts src/data/memory/store.ts src/data/memory/seed.ts src/data/supabase/store.ts tests/integration/supabase-repository.test.ts
git commit -m "feat: agregar moveProjectPhase al repositorio y fijar la fase inicial al convertir"
```

---

## Task 6: Server Action `moveProjectPhaseAction`

**Files:**
- Modify: `src/app/os/proyectos/actions.ts`

**Interfaces:**
- Consumes: `VektriumRepository.moveProjectPhase` (Task 5).
- Produces: `moveProjectPhaseAction(projectId: string, phaseId: string): Promise<MoveProjectPhaseResult>`, `type MoveProjectPhaseResult = { ok: true; project: Project } | { ok: false; message: string }`.

- [ ] **Step 1: Editar `src/app/os/proyectos/actions.ts`**

Reemplazar el contenido completo del archivo por:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import type { Project, Task } from '@/data'
import { getRepository } from '@/data'
import { can } from '@/domain/permissions'
import type { TaskStatus } from '@/domain/progress'
import { requireSession } from '@/lib/session'

export type MoveTaskResult = { ok: true; task: Task } | { ok: false; message: string }

/**
 * Llamado directamente desde el Planner (arrastre o selector movil), no
 * desde un <form>. `moveTask()` del repositorio ya aplica
 * transitionTask() del dominio; si la transicion es invalida devuelve null
 * y aqui se traduce a un mensaje en espanol para que el Planner revierta la
 * tarjeta mostrando por que.
 */
export async function moveTaskAction(taskId: string, status: TaskStatus): Promise<MoveTaskResult> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'task.update' }) === 'none') {
    return { ok: false, message: 'No tienes permiso para mover esta tarea.' }
  }

  const repository = getRepository(session.user.id)
  const task = await repository.moveTask(taskId, status)
  if (!task) {
    return {
      ok: false,
      message: 'No se pudo mover la tarea: no existe, o esa transición no está permitida desde su estado actual.',
    }
  }

  revalidatePath(`/os/proyectos/${task.projectId}`)
  revalidatePath('/os/proyectos')

  return { ok: true, task }
}

export type MoveProjectPhaseResult = { ok: true; project: Project } | { ok: false; message: string }

/**
 * Llamado directamente desde el tablero de proyectos (arrastre o selector
 * movil). Movimiento libre entre fases, sin maquina de estados (a
 * diferencia de moveTaskAction): refleja lo que el equipo decide a mano.
 */
export async function moveProjectPhaseAction(projectId: string, phaseId: string): Promise<MoveProjectPhaseResult> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'project.update' }) === 'none') {
    return { ok: false, message: 'No tienes permiso para mover este proyecto.' }
  }

  const repository = getRepository(session.user.id)
  const project = await repository.moveProjectPhase(projectId, phaseId)
  if (!project) {
    return { ok: false, message: 'No se pudo mover el proyecto: no existe, o esa fase no pertenece a este proyecto.' }
  }

  revalidatePath('/os/proyectos')
  revalidatePath(`/os/proyectos/${projectId}`)

  return { ok: true, project }
}
```

- [ ] **Step 2: Verificar tipos y lint**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/app/os/proyectos/actions.ts
git commit -m "feat: agregar moveProjectPhaseAction para el tablero de proyectos"
```

---

## Task 7: Extraer `useIsDesktop` a un hook compartido

**Files:**
- Create: `src/lib/use-is-desktop.ts`
- Modify: `src/app/os/proyectos/[id]/planner.tsx`

**Interfaces:**
- Produces: `useIsDesktop(breakpointPx?: number): boolean` (usado por Task 8 además de por `planner.tsx`).

- [ ] **Step 1: Crear el hook compartido**

Crear `src/lib/use-is-desktop.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'

/**
 * true si el viewport es de escritorio. Usado por los tableros con arrastre
 * (Planner de tareas, tablero de proyectos por fase) para decidir entre
 * arrastrar-y-soltar (escritorio) o un <select> por tarjeta (movil, donde
 * el drag nativo no es utilizable).
 */
export function useIsDesktop(breakpointPx = 768): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${breakpointPx}px)`)
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [breakpointPx])

  return isDesktop
}
```

- [ ] **Step 2: Usarlo en `planner.tsx`**

En `src/app/os/proyectos/[id]/planner.tsx`:

1) Quitar la función `useIsDesktop` local (líneas 12-24 originales, desde `function useIsDesktop` hasta su `}` de cierre).
2) Cambiar el import de React en la línea 3: de `import { useEffect, useId, useState, useTransition } from 'react'` a `import { useId, useState, useTransition } from 'react'` (ya no se usa `useEffect` directamente en este archivo, era solo para el hook que se movió).
3) Agregar el import del hook compartido junto a los demás imports locales:

```typescript
import { useIsDesktop } from '@/lib/use-is-desktop'
```

- [ ] **Step 3: Verificar tipos y lint**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/use-is-desktop.ts src/app/os/proyectos/[id]/planner.tsx
git commit -m "refactor: extraer useIsDesktop a un hook compartido"
```

---

## Task 8: Tablero de proyectos por fase

**Files:**
- Create: `src/app/os/proyectos/project-board.tsx`
- Modify: `src/app/os/proyectos/page.tsx`

**Interfaces:**
- Consumes: `moveProjectPhaseAction` (Task 6), `useIsDesktop` (Task 7), `VEKTRIUM_PHASES` (`@/domain/phases`), `ProjectWithPhases`, `Client`, `User` (`@/data`).

- [ ] **Step 1: Crear `project-board.tsx`**

Crear `src/app/os/proyectos/project-board.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { Client, ProjectWithPhases, User } from '@/data'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import { calculateProgress } from '@/domain/progress'
import { VEKTRIUM_PHASES } from '@/domain/phases'
import { formatLima } from '@/lib/dashboard'
import { PROJECT_HEALTH_ICON, PROJECT_HEALTH_LABELS, PROJECT_HEALTH_TEXT_CLASS, PROJECT_STATUS_LABELS } from '@/lib/labels'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { moveProjectPhaseAction } from './actions'

type ViewMode = 'tabla' | 'tablero'

function projectProgress(project: ProjectWithPhases): number {
  const tasks = project.phases.flatMap((phase) => phase.tasks)
  return Math.round(calculateProgress(tasks) * 100)
}

/** Fase (con id real) de `order` dentro de las fases concretas de un proyecto. */
function phaseAtOrder(project: ProjectWithPhases, order: number) {
  return project.phases.find((p) => p.order === order)
}

/** `order` de la fase que hoy es `currentPhaseId` de un proyecto. */
function currentOrderOf(project: ProjectWithPhases): number {
  return project.phases.find((p) => p.id === project.currentPhaseId)?.order ?? 0
}

function ProjectCard({
  project,
  clientName,
  draggable,
  isPending,
  onDragStart,
  onMove,
}: {
  project: ProjectWithPhases
  clientName: string
  draggable: boolean
  isPending: boolean
  onDragStart?: (e: React.DragEvent<HTMLLIElement>) => void
  onMove: (projectId: string, order: number) => void
}) {
  const currentOrder = currentOrderOf(project)

  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      aria-busy={isPending}
      className={`border border-vk-line bg-white p-3 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${isPending ? 'opacity-60' : ''}`}
    >
      <Link href={`/os/proyectos/${project.id}`} className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
        {project.code} · {project.name}
      </Link>
      <p className="mt-1 text-xs text-vk-muted">{clientName}</p>
      <p className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold ${PROJECT_HEALTH_TEXT_CLASS[project.health]}`}>
        <span aria-hidden="true">{PROJECT_HEALTH_ICON[project.health]}</span>
        {PROJECT_HEALTH_LABELS[project.health]}
      </p>
      <p className="mt-1 text-xs text-vk-muted">
        {projectProgress(project)}% · vence {formatLima(new Date(project.targetDate))}
      </p>
      {project.isIllustrative ? (
        <div className="mt-1">
          <IllustrativeBadge />
        </div>
      ) : null}

      <label htmlFor={`phase-select-${project.id}`} className="sr-only">
        Mover &quot;{project.name}&quot; a otra fase
      </label>
      <select
        id={`phase-select-${project.id}`}
        value={currentOrder}
        disabled={isPending}
        onChange={(e) => onMove(project.id, Number(e.target.value))}
        className="mt-2 w-full rounded-md border border-vk-line px-2 py-1 text-xs font-bold text-vk-ink disabled:opacity-60"
      >
        {VEKTRIUM_PHASES.map((phase) => (
          <option key={phase.order} value={phase.order}>
            {phase.name}
          </option>
        ))}
      </select>
    </li>
  )
}

export function ProjectBoard({
  initialProjects,
  clients,
}: {
  initialProjects: ProjectWithPhases[]
  clients: Client[]
  users: User[]
}) {
  const [view, setView] = useState<ViewMode>('tabla')
  const [projects, setProjects] = useState(initialProjects)
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const isDesktop = useIsDesktop()
  const clientById = new Map(clients.map((c) => [c.id, c]))
  const userById = new Map(users.map((u) => [u.id, u]))

  function handleMove(projectId: string, order: number) {
    const project = projects.find((p) => p.id === projectId)
    const targetPhase = project ? phaseAtOrder(project, order) : undefined
    if (!project || !targetPhase || project.currentPhaseId === targetPhase.id) return

    const previousProjects = projects
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, currentPhaseId: targetPhase.id } : p)))
    setPendingProjectId(projectId)
    setError(null)

    startTransition(async () => {
      const result = await moveProjectPhaseAction(projectId, targetPhase.id)
      setPendingProjectId(null)
      if (!result.ok) {
        setProjects(previousProjects)
        setError(result.message)
      }
    })
  }

  const activeProjects = projects.filter((p) => p.status === 'activo')

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Vista de proyectos" className="inline-flex rounded-md border border-vk-line bg-white p-1">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'tabla'}
          onClick={() => setView('tabla')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'tabla' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Tabla
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'tablero'}
          onClick={() => setView('tablero')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'tablero' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Tablero
        </button>
      </div>

      {view === 'tabla' ? (
        <div className="overflow-x-auto border border-vk-line bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-vk-line text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">
                <th scope="col" className="px-4 py-3">Proyecto</th>
                <th scope="col" className="px-4 py-3">Cliente</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Salud</th>
                <th scope="col" className="px-4 py-3">Avance</th>
                <th scope="col" className="px-4 py-3">Responsable</th>
                <th scope="col" className="px-4 py-3">Fecha objetivo</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const progress = projectProgress(project)
                return (
                  <tr key={project.id} className="border-b border-vk-line last:border-b-0 hover:bg-vk-ice">
                    <td className="px-4 py-3">
                      <Link href={`/os/proyectos/${project.id}`} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                        {project.code} · {project.name}
                      </Link>
                      {project.isIllustrative ? (
                        <div className="mt-1">
                          <IllustrativeBadge />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-vk-ink">{clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}</td>
                    <td className="px-4 py-3 text-vk-ink">{PROJECT_STATUS_LABELS[project.status]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${PROJECT_HEALTH_TEXT_CLASS[project.health]}`}>
                        <span aria-hidden="true">{PROJECT_HEALTH_ICON[project.health]}</span>
                        {PROJECT_HEALTH_LABELS[project.health]}
                      </span>
                      {project.healthReason ? <p className="mt-1 max-w-[220px] text-xs text-vk-muted">{project.healthReason}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-vk-ice" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full bg-vk-cobalt" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-vk-ink">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-vk-ink">{userById.get(project.ownerId)?.fullName ?? 'Sin asignar'}</td>
                    <td className="px-4 py-3 text-vk-ink">{formatLima(new Date(project.targetDate))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {error ? (
            <p role="alert" className="rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
              {error}
            </p>
          ) : null}

          {activeProjects.length === 0 ? (
            <div className="border border-vk-line bg-white p-8 text-center text-sm text-vk-muted">
              No hay proyectos activos para mostrar en el tablero.
            </div>
          ) : isDesktop ? (
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-3 pb-2">
                {VEKTRIUM_PHASES.map((phase) => {
                  const columnProjects = activeProjects.filter((p) => currentOrderOf(p) === phase.order)
                  return (
                    <div
                      key={phase.order}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const projectId = e.dataTransfer.getData('text/plain')
                        handleMove(projectId, phase.order)
                      }}
                      className="w-64 shrink-0 border border-vk-line bg-vk-ice/60 p-3"
                    >
                      <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                        {phase.name} <span className="text-vk-muted">({columnProjects.length})</span>
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {columnProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            clientName={clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}
                            draggable
                            isPending={pendingProjectId === project.id}
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', project.id)}
                            onMove={handleMove}
                          />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {VEKTRIUM_PHASES.map((phase) => {
                const columnProjects = activeProjects.filter((p) => currentOrderOf(p) === phase.order)
                if (columnProjects.length === 0) return null
                return (
                  <section key={phase.order} aria-label={phase.name}>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                      {phase.name} <span className="text-vk-muted">({columnProjects.length})</span>
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {columnProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          clientName={clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}
                          draggable={false}
                          isPending={pendingProjectId === project.id}
                          onMove={handleMove}
                        />
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Editar `page.tsx`**

Reemplazar el contenido completo de `src/app/os/proyectos/page.tsx` por:

```tsx
import type { Metadata } from 'next'
import { getRepository } from '@/data'
import { requireSession } from '@/lib/session'
import { ProjectBoard } from './project-board'

export const metadata: Metadata = {
  title: 'Proyectos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProyectosPage() {
  const session = await requireSession()

  const repository = getRepository(session.user.id)
  const [projects, clients, users] = await Promise.all([
    repository.listProjectsWithPhases(),
    repository.listClients(),
    repository.listUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Proyectos</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">Cartera de proyectos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          El avance de cada proyecto es ponderado: se calcula siempre a partir de las tareas, nunca se edita a
          mano. La vista Tablero, en cambio, la mueve el equipo a mano: es la fase en la que dicen que está el
          proyecto ahora.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border border-vk-line bg-white p-8 text-center">
          <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay proyectos</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
            Los proyectos nacen al convertir una oportunidad. Ve a{' '}
            <a href="/os/oportunidades" className="font-extrabold text-vk-cobalt hover:text-vk-navy">
              Oportunidades
            </a>{' '}
            y usa &quot;Convertir en proyecto&quot; sobre una oportunidad ganada.
          </p>
        </div>
      ) : (
        <ProjectBoard initialProjects={projects} clients={clients} users={users} />
      )}
    </div>
  )
}
```

Nota: el enlace a Oportunidades en el estado vacío pasa de `<Link>` (importado de `next/link`) a `<a>` porque `page.tsx` ya no importa `Link` para nada más — si el lint de este repo exige `next/link` para enlaces internos (revisar `pnpm lint` en el Step 3), usar en su lugar `import Link from 'next/link'` y `<Link href="/os/oportunidades">`.

- [ ] **Step 3: Verificar tipos y lint**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint
```

Corregir cualquier señal de `next/link` que el lint marque (ver nota del Step 2) antes de continuar.

- [ ] **Step 4: Verificación manual en el navegador**

1. Iniciar el servidor de desarrollo, entrar a `/os/proyectos`, confirmar que "Tabla" se ve igual que antes.
2. Cambiar a "Tablero": confirmar 9 columnas (una por fase VEKTRIUM) y que cada proyecto activo aparece en la columna correspondiente a su fase actual.
3. En escritorio (≥768px): arrastrar una tarjeta de proyecto a otra columna. Confirmar que se mueve, sin mensaje de error.
4. Recargar la página: confirmar que el proyecto sigue en la nueva columna (persistió en la base).
5. Con `resize_window` a un ancho móvil (ej. 375px): confirmar que la tarjeta ya no es arrastrable y en su lugar tiene un `<select>` con las 9 fases; cambiarlo y confirmar que mueve la tarjeta igual que el arrastre.
6. Confirmar que un proyecto con `status: 'archivado'` (ej. "Diagnostico de inventario (piloto)" en datos de desarrollo) **no** aparece en el Tablero pero sí sigue en la Tabla.

- [ ] **Step 5: Correr la batería completa**

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Esperado: todo en verde, incluido el build de producción.

- [ ] **Step 6: Commit**

```bash
git add src/app/os/proyectos/project-board.tsx src/app/os/proyectos/page.tsx
git commit -m "feat: tablero de proyectos por fase en /os/proyectos"
```

---

## Verificación final

Antes de dar el trabajo por terminado:

```bash
export PATH="/c/Users/alvar/AppData/Roaming/fnm/node-versions/v22.23.2/installation:$PATH" && pnpm typecheck && pnpm lint && pnpm test && pnpm test:integration && pnpm build
```

Auditar el diff completo (`git diff main`) buscando secretos antes de hacer `git push` — mismo hábito seguido durante el resto de esta sesión.
