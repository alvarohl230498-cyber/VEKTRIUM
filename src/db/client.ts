import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

/**
 * DATABASE_URL_APP conecta como el rol vektrium_app, creado sin BYPASSRLS.
 * DATABASE_URL (usado solo por src/db/admin) conecta como "postgres", que en
 * Supabase SI tiene BYPASSRLS por defecto — verificado contra la base real.
 * Usar DATABASE_URL aqui haria que esta conexion ignorase las politicas RLS
 * sin que nada lo advirtiera: exactamente el fallo silencioso que este
 * modulo existe para evitar.
 */
const url = process.env.DATABASE_URL_APP
if (!url) throw new Error('Falta DATABASE_URL_APP')

const sql = postgres(url, { max: 10 })

/** Cliente que respeta RLS. Es el unico que debe usarse desde app/. */
export const db = drizzle(sql, { schema })

/**
 * Ejecuta fn dentro de una transaccion identificada como userId, con el rol
 * authenticated activo. auth.uid() (usado por las politicas RLS) lee la
 * variable de sesion request.jwt.claim.sub, que es justo lo que se fija aqui.
 * Toda escritura o lectura sensible a permisos debe pasar por este helper.
 */
export async function withUserContext<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  let result: T
  await sql.begin(async (tx) => {
    await tx.unsafe('set local role authenticated')
    await tx.unsafe(`set local request.jwt.claim.sub = '${userId}'`)
    result = await fn(tx)
  })
  // @ts-expect-error — result se asigna siempre dentro de begin() antes de resolver;
  // TypeScript no puede verlo porque begin() recibe el callback como argumento opaco.
  return result
}
