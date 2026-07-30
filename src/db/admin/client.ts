import 'server-only'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'

/**
 * PELIGRO: este cliente ignora RLS por completo.
 *
 * Usos permitidos: cron de backup y seeds. Nada mas.
 * Importarlo desde src/app rompe el test estructural tests/structure/imports.test.ts.
 */
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const url = process.env.DATABASE_URL
if (!key || !url) throw new Error('Faltan SUPABASE_SERVICE_ROLE_KEY o DATABASE_URL')

// prepare: false — ver el comentario equivalente en src/db/client.ts: obligatorio
// con el pooler de Supabase en modo transaccion (puerto 6543).
const sql = postgres(url, { max: 2, prepare: false })

export const adminDb = drizzle(sql, { schema })
