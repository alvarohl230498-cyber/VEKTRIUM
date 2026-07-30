import 'server-only'
import type { CalendarProvider } from './provider'
import { MockCalendarProvider } from './mock'

let provider: CalendarProvider | null = null

/**
 * Unico punto de entrada al adaptador de calendario. Hoy devuelve siempre el
 * proveedor simulado.
 *
 * TODO(google-calendar): cuando exista el proyecto de Google Cloud y el
 * consentimiento OAuth de calendario (ver `calendar_connections` en el
 * diseno), elegir aqui entre MockCalendarProvider y una GoogleCalendarProvider
 * segun las variables de entorno GOOGLE_CALENDAR_CLIENT_ID,
 * GOOGLE_CALENDAR_CLIENT_SECRET y GOOGLE_CALENDAR_REDIRECT_URI. Ninguna
 * pantalla debe cambiar cuando eso ocurra: ambas implementaciones satisfacen
 * el mismo CalendarProvider.
 */
export function getCalendarProvider(): CalendarProvider {
  if (!provider) provider = new MockCalendarProvider()
  return provider
}

export type {
  CalendarProvider,
  CalendarEvent,
  CalendarError,
  CreateEventInput,
  UpdateEventInput,
} from './provider'
