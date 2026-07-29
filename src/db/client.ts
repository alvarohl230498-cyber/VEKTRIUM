import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('Falta DATABASE_URL')

const sql = postgres(url, { max: 10 })

/** Cliente que respeta RLS. Es el unico que debe usarse desde app/. */
export const db = drizzle(sql, { schema })
