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

  it('SUPABASE_SERVICE_ROLE_KEY solo se lee dentro de src/db/admin', () => {
    const offenders = walk('src')
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => !f.replace(/\\/g, '/').includes('src/db/admin/'))
      .filter((f) => readFileSync(f, 'utf8').includes('SUPABASE_SERVICE_ROLE_KEY'))

    expect(offenders).toEqual([])
  })
})
