import 'server-only'
import type { VektriumRepository } from './repository'
import { createMemoryRepository } from './memory/store'

let repository: VektriumRepository | null = null

/**
 * Unico punto de entrada a la capa de datos. Hoy devuelve siempre la
 * implementacion en memoria.
 *
 * TODO(supabase): cuando exista el proyecto Supabase, esta funcion debe
 * elegir entre esta implementacion y una respaldada por src/db (Drizzle +
 * RLS) segun las variables de entorno NEXT_PUBLIC_SUPABASE_URL,
 * NEXT_PUBLIC_SUPABASE_ANON_KEY y DATABASE_URL. Ninguna pantalla debe
 * cambiar cuando eso ocurra: ambas implementaciones satisfacen el mismo
 * VektriumRepository.
 */
export function getRepository(): VektriumRepository {
  if (!repository) repository = createMemoryRepository()
  return repository
}

export type { VektriumRepository, NewClientInput, NewMeetingInput } from './repository'
export type * from './types'
