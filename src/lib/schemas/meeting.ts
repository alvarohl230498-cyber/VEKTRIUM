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
