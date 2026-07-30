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
