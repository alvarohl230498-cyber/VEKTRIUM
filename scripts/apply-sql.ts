import { readFileSync } from 'node:fs'
import postgres from 'postgres'

/**
 * Aplica un archivo .sql de supabase/migrations/ directamente contra
 * DATABASE_URL, fuera de drizzle-kit (las migraciones de este repo se
 * escriben a mano, ver AGENTS.md). Mismo patron de carga de .env que
 * scripts/seed-founders.ts: no hay dotenv instalado, se parsea a mano y no
 * se sobreescribe lo que ya este en el entorno del proceso.
 *
 * Uso: pnpm db:apply supabase/migrations/0006_project_current_phase.sql
 */
function loadEnv(): void {
  let text: string
  try {
    text = readFileSync('.env', 'utf8')
  } catch {
    return
  }
  for (const line of text.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/)
    const key = match?.[1]
    const value = match?.[2]
    if (key && value !== undefined && !(key in process.env)) process.env[key] = value
  }
}

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
