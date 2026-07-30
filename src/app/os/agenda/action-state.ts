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
}

export const initialMeetingActionState: MeetingActionState = {
  status: 'idle',
  fieldErrors: {},
  formError: null,
  conflicts: [],
  meetingId: null,
}
