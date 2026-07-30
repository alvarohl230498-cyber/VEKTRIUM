import { readFileSync } from 'node:fs'

/**
 * Parsea `.env` a mano (dotenv no esta instalado en este repo, ver
 * AGENTS.md / CLAUDE.md) y vuelca las claves en `process.env`. No
 * sobreescribe variables ya presentes en el entorno del proceso, para que
 * una variable pasada por la shell (p. ej. `FOUNDER_EMAILS=... pnpm
 * seed:founders`) siga ganando sobre cualquier valor que .env pudiera
 * definir. Compartido por scripts/apply-sql.ts y scripts/seed-founders.ts.
 */
export function loadEnv(): void {
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
