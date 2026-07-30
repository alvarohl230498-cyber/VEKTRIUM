import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe('frontera de la clave de servicio', () => {
  it('ningun archivo bajo src/app importa src/db/admin', () => {
    const offenders = walk('src/app')
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => /from\s+['"](@\/db\/admin|.*\/db\/admin)/.test(readFileSync(f, 'utf8')))

    expect(offenders).toEqual([])
  })

  it('SUPABASE_SERVICE_ROLE_KEY solo se lee en los modulos autorizados', () => {
    // src/db/admin: acceso Drizzle/Postgres con service_role, bypassa RLS.
    // src/lib/supabase-admin-auth.ts: acceso al SDK de Auth con service_role,
    // usado unicamente por requestMagicLink() para generateLink() — Supabase
    // no puede enviar el correo el mismo (su SMTP rechaza el remitente de
    // pruebas de Resend), asi que la app genera el token y lo envia ella
    // misma via la API REST de Resend. Ninguno de los dos se importa desde
    // codigo que atienda peticiones ya autenticadas.
    const ALLOWED = ['src/db/admin/', 'src/lib/supabase-admin-auth.ts']

    const offenders = walk('src')
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => !ALLOWED.some((allowed) => f.replace(/\\/g, '/').includes(allowed)))
      .filter((f) => readFileSync(f, 'utf8').includes('SUPABASE_SERVICE_ROLE_KEY'))

    expect(offenders).toEqual([])
  })
})
