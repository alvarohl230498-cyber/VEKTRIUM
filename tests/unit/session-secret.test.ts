import { describe, it, expect, vi, afterEach } from 'vitest'
import { getSessionSecret, INSECURE_DEV_SECRET } from '@/lib/session-secret'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getSessionSecret()', () => {
  it('usa SESSION_SECRET cuando esta configurado', () => {
    vi.stubEnv('SESSION_SECRET', 'un-secreto-real-de-produccion')
    vi.stubEnv('NODE_ENV', 'production')
    expect(getSessionSecret()).toBe('un-secreto-real-de-produccion')
  })

  it('NUNCA usa el secreto de respaldo en produccion', () => {
    vi.stubEnv('SESSION_SECRET', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(getSessionSecret()).toBeNull()
  })

  it('sin secreto en produccion no hay con que firmar, asi que nadie entra', () => {
    // El respaldo esta en el codigo fuente y es publico: si se usara en
    // produccion, cualquiera con acceso al repositorio podria fabricar una
    // cookie valida y entrar al portal. Este test es la barrera.
    vi.stubEnv('SESSION_SECRET', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(getSessionSecret()).not.toBe(INSECURE_DEV_SECRET)
  })

  it('permite el respaldo en desarrollo para poder trabajar sin configuracion', () => {
    vi.stubEnv('SESSION_SECRET', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(getSessionSecret()).toBe(INSECURE_DEV_SECRET)
  })

  it('permite el respaldo en los tests', () => {
    vi.stubEnv('SESSION_SECRET', '')
    vi.stubEnv('NODE_ENV', 'test')
    expect(getSessionSecret()).toBe(INSECURE_DEV_SECRET)
  })
})
