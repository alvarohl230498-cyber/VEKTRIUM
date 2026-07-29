import { afterEach, describe, expect, it, vi } from 'vitest'
import { isDevSignInEnabled } from '@/lib/dev-auth'

describe('acceso de desarrollo (isDevSignInEnabled)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('se rehusa cuando NODE_ENV es production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isDevSignInEnabled()).toBe(false)
  })

  it('permite el acceso de desarrollo en development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isDevSignInEnabled()).toBe(true)
  })

  it('permite el acceso de desarrollo en test', () => {
    vi.stubEnv('NODE_ENV', 'test')
    expect(isDevSignInEnabled()).toBe(true)
  })
})
