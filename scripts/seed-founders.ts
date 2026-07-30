import { loadEnv } from './load-env'

/**
 * Este script se ejecuta con `node --conditions=react-server --import tsx`
 * (ver el script "seed:founders" en package.json), no con `tsx` a secas.
 * src/db/admin/client.ts empieza con `import 'server-only'`: ese paquete
 * resuelve a un modulo vacio SOLO bajo la condicion de exports
 * "react-server" (la que activa el bundler de Next.js); en Node puro, sin
 * esa condicion, siempre carga la version que lanza
 * `Error: This module cannot be imported from a Client Component module`.
 * `--conditions=react-server` hace que Node trate esta condicion como
 * activa y cargue el modulo vacio, igual que hace Next.js en build.
 *
 * dotenv no esta instalado en este repo (ver AGENTS.md / CLAUDE.md): se
 * parsea .env a mano via scripts/load-env.ts, igual que
 * tests/integration/helpers/db.ts. No sobreescribe variables ya presentes
 * en el entorno del proceso, para que `FOUNDER_EMAILS=... pnpm
 * seed:founders` (pasada por la shell) siga ganando sobre cualquier valor
 * que .env pudiera definir.
 */
loadEnv()

const emails = (process.env.FOUNDER_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

async function main() {
  if (emails.length === 0) {
    console.error('Define FOUNDER_EMAILS con los correos separados por coma.')
    process.exit(1)
  }

  // Import dinamico deliberado: src/db/admin/client.ts lee DATABASE_URL y
  // SUPABASE_SERVICE_ROLE_KEY de process.env en su propio top-level. Un
  // `import` estatico se evaluaria ANTES que loadEnv() de arriba (los
  // imports estaticos se izan sobre el resto del modulo); el import
  // dinamico se evalua en el punto exacto de esta linea, con .env ya
  // cargado. Mismo motivo documentado en
  // tests/integration/supabase-repository.test.ts.
  const { adminDb } = await import('../src/db/admin/client')
  const { authorizedUsers } = await import('../src/db/schema')

  for (const email of emails) {
    await adminDb
      .insert(authorizedUsers)
      .values({ email, role: 'FOUNDER_ADMIN', status: 'activo' })
      .onConflictDoUpdate({
        target: authorizedUsers.email,
        set: { role: 'FOUNDER_ADMIN', status: 'activo' },
      })
    console.log(`Autorizado: ${email}`)
  }

  process.exit(0)
}

void main()
