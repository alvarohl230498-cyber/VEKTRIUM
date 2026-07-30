import 'server-only'
import { eq } from 'drizzle-orm'
import { adminDb } from '@/db/admin/client'
import { authorizedUsers, users } from '@/db/schema'
import type { Role } from '@/domain/roles'

/**
 * Unico puente permitido entre el callback de magic link (src/app/auth/
 * callback/route.ts) y src/db/admin. Existe para que ningun archivo bajo
 * src/app importe @/db/admin directamente: tests/structure/imports.test.ts
 * y la regla no-restricted-imports de eslint.config.mjs lo prohiben para
 * TODO src/app/**, sin excepcion para el callback de auth.
 *
 * El callback necesita adminDb (bypassa RLS) por una razon real: en ese
 * instante todavia no existe una sesion propia del portal — se esta
 * creando ahora mismo — asi que withUserContext() no tiene un userId con el
 * que auth.uid() pudiera resolver ninguna politica RLS. Es la unica ventana
 * de la app donde una consulta de pre-autenticacion sin sesion es
 * necesaria. Ambas funciones de este modulo se mantienen deliberadamente
 * minimas: nada de logica de negocio, solo la consulta y el upsert que el
 * callback necesita.
 */

export interface AuthorizedUserRecord {
  role: Role
  status: 'pendiente' | 'activo' | 'revocado'
}

export async function findAuthorizedUser(email: string): Promise<AuthorizedUserRecord | null> {
  const [row] = await adminDb.select().from(authorizedUsers).where(eq(authorizedUsers.email, email))
  if (!row) return null
  return { role: row.role as Role, status: row.status }
}

export interface ProvisionedUser {
  id: string
  email: string
  fullName: string
  role: Role
}

/**
 * Upsert en `users` con id = uuid de Supabase Auth (data.user.id en el
 * callback). No colisiona con los ids ficticios 'user-juan-diego' /
 * 'user-alvaro' de src/data/memory/seed.ts: esos solo existen en el
 * repositorio en memoria (un almacen en RAM, separado por completo de esta
 * tabla de Postgres), y sus correos (@vektrium.pe) tampoco coinciden con el
 * correo real usado en el magic link. Ver el reporte de implementacion.
 */
export async function provisionUser(input: {
  id: string
  email: string
  fullName: string | null
  role: Role
}): Promise<ProvisionedUser | null> {
  const [row] = await adminDb
    .insert(users)
    .values({
      id: input.id,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: input.email, role: input.role, lastSeenAt: new Date(), updatedAt: new Date() },
    })
    .returning()

  if (!row) return null
  return { id: row.id, email: row.email, fullName: row.fullName ?? '', role: row.role as Role }
}
