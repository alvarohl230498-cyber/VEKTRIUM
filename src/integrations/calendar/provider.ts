import type { Result } from '@/domain/result'

/**
 * Adaptador de calendario (seccion 4 del diseno). `MockCalendarProvider` es
 * la unica implementacion hoy; `GoogleCalendarProvider` implementara la
 * misma interfaz cuando existan credenciales de Google, sin que ninguna
 * pantalla cambie.
 */
export interface CalendarError {
  code: 'SOLICITUD_INVALIDA' | 'EVENTO_NO_ENCONTRADO' | 'PROVEEDOR_NO_DISPONIBLE'
  message: string
}

export interface CreateEventInput {
  /** Clave de idempotencia: reintentar con el mismo requestId no debe duplicar el evento. */
  requestId: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  organizerEmail: string
  attendeeEmails: string[]
}

export interface UpdateEventInput {
  title?: string
  description?: string
  startsAt?: string
  endsAt?: string
  attendeeEmails?: string[]
}

export interface CalendarEvent {
  providerEventId: string
  meetUrl: string
  /** true si el evento fue generado por MockCalendarProvider, nunca por Google real. */
  isMock: boolean
  requestId: string
}

export interface CalendarProvider {
  readonly kind: 'mock' | 'google'
  createEvent(input: CreateEventInput): Promise<Result<CalendarEvent, CalendarError>>
  updateEvent(providerEventId: string, input: UpdateEventInput): Promise<Result<CalendarEvent, CalendarError>>
  cancelEvent(providerEventId: string): Promise<Result<void, CalendarError>>
}
