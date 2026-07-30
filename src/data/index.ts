import 'server-only'
import type { VektriumRepository } from './repository'
import { createMemoryRepository } from './memory/store'
import { createSupabaseRepository } from './supabase/store'

let memoryRepository: VektriumRepository | null = null

/**
 * Unico punto de entrada a la capa de datos.
 *
 * Cuando DATABASE_URL_APP esta definida, devuelve la implementacion
 * respaldada por Supabase (Drizzle + RLS), cerrada sobre `actingUserId`:
 * cada lectura y escritura de esa implementacion abre una transaccion con
 * withUserContext(actingUserId, ...), que es lo unico que hace que
 * auth.uid() resuelva dentro de las politicas RLS (verificado contra el
 * proyecto real). Por eso `actingUserId` es obligatorio en ese modo: sin el
 * no hay forma de que una lectura devuelva ninguna fila.
 *
 * Sin DATABASE_URL_APP (tests, o un entorno local sin Supabase configurado)
 * devuelve la implementacion en memoria de siempre, que ignora
 * `actingUserId` porque no tiene RLS que satisfacer. Se cachea a nivel de
 * modulo porque es la unica que tiene estado real que debe sobrevivir entre
 * peticiones; la implementacion de Supabase no necesita cache: construirla
 * es barato (solo cierra funciones sobre actingUserId), la conexion pooled
 * real vive en src/db/client.ts.
 *
 * Todo caller de getRepository() bajo src/app/os debe pasar
 * `session.user.id` (via requireSession()/getSession()). Los call sites que
 * se ejecutan antes de que exista sesion (el propio login) no pueden usar
 * este repositorio en modo Supabase — ver el reporte de implementacion para
 * el detalle de esa limitacion conocida en el flujo de acceso de desarrollo.
 */
export function getRepository(actingUserId?: string): VektriumRepository {
  if (process.env.DATABASE_URL_APP) {
    if (!actingUserId) {
      throw new Error(
        'getRepository() necesita actingUserId cuando DATABASE_URL_APP esta definida: sin el, ' +
          'ninguna politica RLS resuelve y toda lectura devolveria cero filas.',
      )
    }
    return createSupabaseRepository(actingUserId)
  }

  if (!memoryRepository) memoryRepository = createMemoryRepository()
  return memoryRepository
}

export type {
  VektriumRepository,
  NewClientInput,
  NewMeetingInput,
  MeetingSyncPatch,
  ConvertOpportunityInput,
  NewOpportunityInput,
} from './repository'
export type * from './types'
export { MEETING_TYPES } from './types'
