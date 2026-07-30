import type { Meeting, MeetingType } from '@/data'

/**
 * Funciones puras para la Agenda: sin I/O, para poder probarlas sin levantar
 * Next ni la capa de datos. `America/Lima` es fija en UTC-5 todo el ano (sin
 * horario de verano desde 1990), asi que las funciones que arman una fecha a
 * partir de un `date` + `time` locales pueden fijar el offset "-05:00" sin
 * volverse incorrectas en otra epoca del ano.
 */

export const LIMA_OFFSET = '-05:00'
export const LIMA_TIME_ZONE = 'America/Lima'

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  contacto_inicial: 'Contacto inicial',
  descubrimiento: 'Descubrimiento',
  levantamiento: 'Levantamiento',
  validacion: 'Validación',
  revision_avance: 'Revisión de avance',
  presentacion_prototipo: 'Presentación de prototipo',
  presentacion_final: 'Presentación final',
  entrega_capacitacion: 'Entrega y capacitación',
  seguimiento_postentrega: 'Seguimiento postentrega',
  reunion_interna: 'Reunión interna',
}

export const MEETING_SYNC_LABELS: Record<Meeting['syncStatus'], string> = {
  pendiente: 'Pendiente',
  sincronizada: 'Sincronizada',
  fallida: 'Fallida',
}

export const DURATION_PRESETS_MINUTES = [15, 30, 45, 60, 90] as const

/** Construye un ISO instant a partir de fecha y hora locales de Lima. */
export function buildLimaIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00${LIMA_OFFSET}`).toISOString()
}

export function addMinutesIso(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

/** Clave de agrupacion por dia en zona Lima, ordenable como cadena (YYYY-MM-DD). */
export function limaDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LIMA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatLimaDayHeading(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatLimaTime(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatLimaMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-PE', {
    timeZone: LIMA_TIME_ZONE,
    month: 'long',
    year: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export const LIMA_WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export interface MeetingDayGroup {
  dateKey: string
  heading: string
  isPast: boolean
  meetings: Meeting[]
}

/** Agrupa reuniones por dia (zona Lima), ordenadas cronologicamente. */
export function groupMeetingsByDay(meetings: Meeting[], now: Date): MeetingDayGroup[] {
  const todayKey = limaDateKey(now)
  const groups = new Map<string, Meeting[]>()

  const sorted = [...meetings].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )

  for (const meeting of sorted) {
    const key = limaDateKey(new Date(meeting.startsAt))
    const bucket = groups.get(key)
    if (bucket) bucket.push(meeting)
    else groups.set(key, [meeting])
  }

  return Array.from(groups.entries()).map(([dateKey, dayMeetings]) => ({
    dateKey,
    heading: formatLimaDayHeading(new Date(dayMeetings[0]?.startsAt ?? now)),
    isPast: dateKey < todayKey,
    meetings: dayMeetings,
  }))
}

export interface MonthCell {
  date: Date
  dateKey: string
  inCurrentMonth: boolean
  isToday: boolean
  meetings: Meeting[]
}

/** Arma una grilla de semanas completas (domingo a sabado) para el mes de `monthDate`. */
export function buildMonthGrid(monthDate: Date, meetings: Meeting[], now: Date): MonthCell[][] {
  const todayKey = limaDateKey(now)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startWeekday)

  const meetingsByDay = new Map<string, Meeting[]>()
  for (const meeting of meetings) {
    const key = limaDateKey(new Date(meeting.startsAt))
    const bucket = meetingsByDay.get(key)
    if (bucket) bucket.push(meeting)
    else meetingsByDay.set(key, [meeting])
  }

  const weeks: MonthCell[][] = []
  let cursor = new Date(gridStart)
  for (let week = 0; week < 6; week += 1) {
    const row: MonthCell[] = []
    for (let day = 0; day < 7; day += 1) {
      const dateKey = limaDateKey(cursor)
      row.push({
        date: new Date(cursor),
        dateKey,
        inCurrentMonth: cursor.getMonth() === month,
        isToday: dateKey === todayKey,
        meetings: meetingsByDay.get(dateKey) ?? [],
      })
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
    }
    weeks.push(row)
    // Si ya pasamos el mes y la fila esta vacia de dias del mes actual, no hace falta una sexta fila.
    if (week >= 4 && row.every((cell) => !cell.inCurrentMonth)) break
  }

  return weeks
}

export interface SchedulingConflictInput {
  meetings: Meeting[]
  organizerId: string
  startsAt: string
  endsAt: string
  excludeMeetingId?: string
}

/** Reuniones del mismo organizador cuyo horario se superpone con el propuesto. */
export function findSchedulingConflicts(input: SchedulingConflictInput): Meeting[] {
  const start = new Date(input.startsAt).getTime()
  const end = new Date(input.endsAt).getTime()

  return input.meetings.filter((meeting) => {
    if (meeting.organizerId !== input.organizerId) return false
    if (input.excludeMeetingId && meeting.id === input.excludeMeetingId) return false
    const meetingStart = new Date(meeting.startsAt).getTime()
    const meetingEnd = new Date(meeting.endsAt).getTime()
    return meetingStart < end && start < meetingEnd
  })
}
