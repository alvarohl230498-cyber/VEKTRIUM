import { describe, it, expect } from 'vitest'
import { ROLES } from '@/domain/roles'

describe('infraestructura de pruebas', () => {
  it('resuelve el alias @/ hacia src/', () => {
    expect(ROLES).toBeDefined()
  })
})
