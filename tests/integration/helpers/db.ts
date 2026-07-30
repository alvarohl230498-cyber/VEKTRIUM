import { readFileSync } from 'node:fs'
import postgres from 'postgres'

/**
 * Los tests de integracion corren contra el proyecto Supabase real (no hay
 * Postgres local en Docker en este entorno). dotenv no esta instalado; se
 * parsea .env a mano, igual que el resto de scripts de este repo.
 */
function loadEnv(): void {
  const text = readFileSync('.env', 'utf8')
  for (const line of text.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    const key = match?.[1]
    const value = match?.[2]
    if (key && value !== undefined) process.env[key] = value
  }
}
loadEnv()

const adminUrl = process.env.DATABASE_URL
const appUrl = process.env.DATABASE_URL_APP
if (!adminUrl) throw new Error('Falta DATABASE_URL en .env')
if (!appUrl) throw new Error('Falta DATABASE_URL_APP en .env — falta crear el rol vektrium_app')

/** Bypassa RLS (rol postgres). Solo para arrange/cleanup de los tests. */
export const adminSql = postgres(adminUrl, { max: 3 })

/** Respeta RLS (rol vektrium_app, sin BYPASSRLS). El mismo camino que usa la app real. */
const appSql = postgres(appUrl, { max: 5 })

export class RlsError extends Error {}

/**
 * Ejecuta fn dentro de una transaccion identificada como userId, con el rol
 * authenticated activo — la misma combinacion que usara src/db/client.ts en
 * produccion. La transaccion se revierte siempre al terminar: los tests no
 * dejan huella en la base.
 */
export async function asUser<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  let result: T | undefined
  let captured: unknown
  try {
    await appSql.begin(async (tx) => {
      await tx.unsafe(`set local role authenticated`)
      await tx.unsafe(`set local request.jwt.claim.sub = '${userId}'`)
      try {
        result = await fn(tx)
      } catch (e) {
        captured = e
      }
      // Fuerza rollback siempre, tanto si fn tuvo exito como si lanzo.
      throw new Error('__ROLLBACK__')
    })
  } catch (e) {
    if (!(e instanceof Error) || e.message !== '__ROLLBACK__') throw e
  }
  if (captured) throw captured
  return result as T
}

/** Como asUser pero sin identidad: simula una sesion sin sesion valida. */
export async function asAnonymous<T>(fn: (tx: postgres.TransactionSql) => Promise<T>): Promise<T> {
  let result: T | undefined
  let captured: unknown
  try {
    await appSql.begin(async (tx) => {
      await tx.unsafe(`set local role authenticated`)
      try {
        result = await fn(tx)
      } catch (e) {
        captured = e
      }
      throw new Error('__ROLLBACK__')
    })
  } catch (e) {
    if (!(e instanceof Error) || e.message !== '__ROLLBACK__') throw e
  }
  if (captured) throw captured
  return result as T
}

export async function closeDb(): Promise<void> {
  await Promise.all([adminSql.end(), appSql.end()])
}
