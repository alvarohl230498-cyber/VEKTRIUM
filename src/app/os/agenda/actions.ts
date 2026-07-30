'use server'

import { revalidatePath } from 'next/cache'
import type { Meeting, MeetingAttendee, MeetingSyncStatus } from '@/data'
import { getRepository } from '@/data'
import { can } from '@/domain/permissions'
import { getCalendarProvider } from '@/integrations/calendar'
import { addMinutesIso, buildLimaIso, findSchedulingConflicts } from '@/lib/agenda'
import { meetingFormSchema, meetingLinkSchema, meetingNotesSchema, resolveDurationMinutes } from '@/lib/schemas/meeting'
import { requireSession } from '@/lib/session'
import {
  initialMeetingActionState,
  initialSimpleActionState,
  type MeetingActionState,
  type SimpleActionState,
} from './action-state'

function fail(fieldErrors: Record<string, string>, formError: string): MeetingActionState {
  return { ...initialMeetingActionState, status: 'error', fieldErrors, formError }
}

/**
 * Crea una reunion. Flujo en dos pasos cuando hay conflicto de horario para
 * el organizador elegido: la primera llamada devuelve `status: 'conflict'`
 * con el listado de reuniones superpuestas y NO guarda nada (regla del
 * brief: advertir, no bloquear). El formulario ofrece un boton "Guardar de
 * todas formas" que reenvia el mismo `requestId` con `confirmConflict=true`.
 */
export async function createMeetingAction(
  _prevState: MeetingActionState,
  formData: FormData,
): Promise<MeetingActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'meeting.create' }) === 'none') {
    return { ...initialMeetingActionState, status: 'error', formError: 'No tienes permiso para crear reuniones.' }
  }

  const raw = {
    clientId: formData.get('clientId') ?? '',
    projectId: formData.get('projectId') ?? '',
    type: formData.get('type') ?? '',
    title: formData.get('title') ?? '',
    organizerId: formData.get('organizerId') ?? '',
    date: formData.get('date') ?? '',
    startTime: formData.get('startTime') ?? '',
    durationMinutes: formData.get('durationMinutes') ?? '',
    customDurationMinutes: formData.get('customDurationMinutes') ?? '',
    attendeeKeys: formData.getAll('attendeeKeys'),
    agenda: formData.get('agenda') ?? '',
    createMeet: formData.get('createMeet') ?? '',
    requestId: formData.get('requestId') ?? '',
    confirmConflict: formData.get('confirmConflict') ?? '',
  }

  const parsed = meetingFormSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return fail(fieldErrors, 'Revisa los campos marcados en rojo.')
  }

  const values = parsed.data
  const repository = getRepository(session.user.id)

  const [client, projects, users] = await Promise.all([
    repository.getClientById(values.clientId),
    repository.listProjects(),
    repository.listUsers(),
  ])

  if (!client) return fail({ clientId: 'Selecciona un cliente valido.' }, 'Revisa los campos marcados en rojo.')

  if (values.projectId) {
    const project = projects.find((p) => p.id === values.projectId)
    if (!project || project.clientId !== values.clientId) {
      return fail(
        { projectId: 'Ese proyecto no pertenece al cliente seleccionado.' },
        'Revisa los campos marcados en rojo.',
      )
    }
  }

  const organizer = users.find((u) => u.id === values.organizerId)
  if (!organizer) {
    return fail({ organizerId: 'Selecciona un organizador valido.' }, 'Revisa los campos marcados en rojo.')
  }

  const durationMinutes = resolveDurationMinutes(values)
  const startsAt = buildLimaIso(values.date, values.startTime)
  const endsAt = addMinutesIso(startsAt, durationMinutes)

  if (Number.isNaN(new Date(startsAt).getTime())) {
    return fail({ date: 'La combinacion de fecha y hora no es valida.' }, 'Revisa los campos marcados en rojo.')
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

  let isMock = false
  let meetUrl: string | null = null
  let providerEventId: string | null = null
  let syncStatus: MeetingSyncStatus = 'sincronizada'
  let syncError: string | null = null

  if (values.createMeet === 'on') {
    const provider = getCalendarProvider()
    const result = await provider.createEvent({
      requestId: values.requestId,
      title: values.title,
      description: values.agenda,
      startsAt,
      endsAt,
      organizerEmail: organizer.email,
      attendeeEmails: attendees.map((a) => a.email),
    })

    isMock = provider.kind === 'mock'
    if (result.ok) {
      meetUrl = result.value.meetUrl
      providerEventId = result.value.providerEventId
      syncStatus = 'sincronizada'
    } else {
      syncStatus = 'fallida'
      syncError = result.error.message
    }
  }

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

  return { ...initialMeetingActionState, status: 'success', meetingId: meeting.id }
}

/**
 * Reintenta sincronizar una reunion cuya syncStatus es 'fallida'. Reutiliza
 * el mismo requestId ya guardado en la reunion: si el proveedor ya habia
 * creado el evento en un intento previo, la idempotencia del mock (y de
 * Google en el futuro) garantiza que se recupera el mismo evento en vez de
 * crear uno duplicado.
 */
export async function retryMeetingSyncAction(meetingId: string): Promise<void> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'meeting.update' }) === 'none') return

  const repository = getRepository(session.user.id)
  const [meetings, users] = await Promise.all([repository.listMeetings(), repository.listUsers()])
  const meeting: Meeting | undefined = meetings.find((m) => m.id === meetingId)
  if (!meeting) return

  const organizer = users.find((u) => u.id === meeting.organizerId)
  const provider = getCalendarProvider()
  const result = await provider.createEvent({
    requestId: meeting.requestId,
    title: meeting.title,
    description: meeting.agenda,
    startsAt: meeting.startsAt,
    endsAt: meeting.endsAt,
    organizerEmail: organizer?.email ?? '',
    attendeeEmails: meeting.attendees.map((a) => a.email),
  })

  if (result.ok) {
    await repository.updateMeetingStatus(meetingId, {
      syncStatus: 'sincronizada',
      syncError: null,
      meetUrl: result.value.meetUrl,
      providerEventId: result.value.providerEventId,
      isMock: provider.kind === 'mock',
    })
  } else {
    await repository.updateMeetingStatus(meetingId, {
      syncStatus: 'fallida',
      syncError: result.error.message,
    })
  }

  revalidatePath('/os/agenda')
  revalidatePath('/os')
}

/**
 * Pega el enlace real de una reunion programada a mano en Google Meet
 * (fuera de VEKTRIUM, sin credenciales de Google conectadas). Marca
 * isMock=false y syncStatus='sincronizada': el enlace ya es real, no un
 * simulacro, aunque VEKTRIUM no lo haya creado.
 */
export async function updateMeetingLinkAction(
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'meeting.update' }) === 'none') {
    return { status: 'error', error: 'No tienes permiso para editar esta reunión.' }
  }

  const parsed = meetingLinkSchema.safeParse({
    meetingId: formData.get('meetingId'),
    meetUrl: formData.get('meetUrl'),
  })
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Enlace inválido.' }
  }

  const repository = getRepository(session.user.id)
  const updated = await repository.updateMeetingStatus(parsed.data.meetingId, {
    syncStatus: 'sincronizada',
    syncError: null,
    meetUrl: parsed.data.meetUrl,
    isMock: false,
    providerEventId: null,
  })
  if (!updated) return { status: 'error', error: 'La reunión ya no existe.' }

  revalidatePath('/os/agenda')
  revalidatePath('/os')
  return { ...initialSimpleActionState, status: 'success' }
}

/** Guarda las notas de una reunion. Reemplaza el texto anterior por completo, sin versionado. */
export async function updateMeetingNotesAction(
  _prevState: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'meeting.update' }) === 'none') {
    return { status: 'error', error: 'No tienes permiso para editar esta reunión.' }
  }

  const parsed = meetingNotesSchema.safeParse({
    meetingId: formData.get('meetingId'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Notas inválidas.' }
  }

  const repository = getRepository(session.user.id)
  const updated = await repository.updateMeetingNotes(parsed.data.meetingId, parsed.data.notes)
  if (!updated) return { status: 'error', error: 'La reunión ya no existe.' }

  revalidatePath('/os/agenda')
  revalidatePath('/os')
  return { ...initialSimpleActionState, status: 'success' }
}
