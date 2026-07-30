import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import { loadEnv } from './load-env'

/**
 * Aplica un archivo .sql de supabase/migrations/ directamente contra
 * DATABASE_URL, fuera de drizzle-kit (las migraciones de este repo se
 * escriben a mano, ver AGENTS.md). Mismo cargador de .env que
 * scripts/seed-founders.ts (ver scripts/load-env.ts): no hay dotenv
 * instalado, se parsea a mano y no se sobreescribe lo que ya este en el
 * entorno del proceso.
 *
 * Uso: pnpm db:apply supabase/migrations/0006_project_current_phase.sql
 */

async function main() {
  loadEnv()
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Uso: pnpm db:apply <ruta-al-archivo.sql>')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Falta DATABASE_URL en el entorno o en .env.')
    process.exit(1)
  }

  const sql = postgres(databaseUrl, { max: 1 })
  try {
    const migration = readFileSync(filePath, 'utf8')
    await sql.unsafe(migration)
    console.log(`Aplicado: ${filePath}`)
  } finally {
    await sql.end()
  }
}

void main()
