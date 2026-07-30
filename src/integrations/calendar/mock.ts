import { randomUUID } from 'node:crypto'
import { err, ok, type Result } from '@/domain/result'
import type {
  CalendarError,
  CalendarEvent,
  CalendarProvider,
  CreateEventInput,
  UpdateEventInput,
} from './provider'

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 40)
  return slug.length > 0 ? slug : 'reunion'
}

/**
 * Proveedor de calendario simulado. Nunca contacta un servicio externo:
 * genera un id de evento y una URL de Meet falsos pero con forma realista, y
 * marca todo lo que devuelve con `isMock: true` para que la interfaz pueda
 * mostrar la insignia SIMULADO (regla 14 del prompt maestro).
 *
 * Cumple la restriccion de idempotencia real de Google Calendar: reintentar
 * `createEvent` con el mismo `requestId` devuelve SIEMPRE el mismo evento en
 * vez de crear uno duplicado. Eso es lo que permite reintentar una
 * sincronizacion fallida sin miedo a duplicar la reunion.
 */
export class MockCalendarProvider implements CalendarProvider {
  readonly kind = 'mock' as const

  private readonly eventsByRequestId = new Map<string, CalendarEvent>()
  private readonly eventsByProviderId = new Map<string, CalendarEvent>()

  async createEvent(input: CreateEventInput): Promise<Result<CalendarEvent, CalendarError>> {
    if (!input.requestId) {
      return err({
        code: 'SOLICITUD_INVALIDA',
        message: 'Falta el identificador de solicitud (requestId) para crear el evento simulado.',
      })
    }

    const existing = this.eventsByRequestId.get(input.requestId)
    if (existing) return ok(existing)

    const providerEventId = `mock-evt-${randomUUID()}`
    const meetUrl = `https://meet.vektrium.dev/mock/${slugify(input.title)}-${providerEventId.slice(-8)}`
    const event: CalendarEvent = {
      providerEventId,
      meetUrl,
      isMock: true,
      requestId: input.requestId,
    }

    this.eventsByRequestId.set(input.requestId, event)
    this.eventsByProviderId.set(providerEventId, event)
    return ok(event)
  }

  async updateEvent(
    providerEventId: string,
    input: UpdateEventInput,
  ): Promise<Result<CalendarEvent, CalendarError>> {
    void input
    const existing = this.eventsByProviderId.get(providerEventId)
    if (!existing) {
      return err({
        code: 'EVENTO_NO_ENCONTRADO',
        message: `No existe un evento simulado con id "${providerEventId}".`,
      })
    }
    // El mock no versiona los campos actualizados; confirma el mismo evento.
    return ok(existing)
  }

  async cancelEvent(providerEventId: string): Promise<Result<void, CalendarError>> {
    const existing = this.eventsByProviderId.get(providerEventId)
    if (!existing) {
      return err({
        code: 'EVENTO_NO_ENCONTRADO',
        message: `No existe un evento simulado con id "${providerEventId}".`,
      })
    }
    this.eventsByProviderId.delete(providerEventId)
    this.eventsByRequestId.delete(existing.requestId)
    return ok(undefined)
  }
}
