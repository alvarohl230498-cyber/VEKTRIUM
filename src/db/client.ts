import postgres from 'postgres'
import { sql as rawSql } from 'drizzle-orm'
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

const client = postgres(url, { max: 10 })

/** Cliente que respeta RLS. Es el unico que debe usarse desde app/. */
export const db = drizzle(client, { schema })

/**
 * Tipo del `tx` que entrega db.transaction(). Se deriva del propio metodo en
 * vez de nombrarlo a mano porque los genericos de PgTransaction dependen del
 * schema y del dialecto exacto; extraerlo asi es lo unico que se mantiene en
 * sincronia sin esfuerzo si cambia la version de drizzle-orm.
 */
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Ejecuta fn dentro de una transaccion identificada como userId, con el rol
 * authenticated activo. auth.uid() (usado por las politicas RLS) lee la
 * variable de sesion request.jwt.claim.sub, que es justo lo que se fija aqui.
 * Toda escritura o lectura sensible a permisos debe pasar por este helper.
 *
 * Usa db.transaction() (no sql.begin() crudo) para que el `tx` que recibe fn
 * sea una instancia de Drizzle utilizable con .select()/.insert()/etc. sin
 * envolverla de nuevo: volver a llamar drizzle(tx, ...) sobre una transaccion
 * activa de postgres.js rompe en tiempo de ejecucion, porque una transaccion
 * no expone la misma forma interna que la conexion de nivel superior.
 *
 * SET LOCAL no admite parametros vinculados en el protocolo de Postgres, asi
 * que el userId se interpola como texto — de ahi la validacion de formato UUID
 * antes de construir la sentencia, en vez de confiar en que el llamador nunca
 * pase otra cosa.
 */
export async function withUserContext<T>(
  userId: string,
  fn: (tx: DbTransaction) => Promise<T>,
): Promise<T> {
  if (!UUID_RE.test(userId)) {
    throw new Error(`withUserContext: userId no tiene forma de UUID: "${userId}"`)
  }

  return db.transaction(async (tx) => {
    await tx.execute(rawSql.raw('set local role authenticated'))
    await tx.execute(rawSql.raw(`set local request.jwt.claim.sub = '${userId}'`))
    return fn(tx)
  })
}
