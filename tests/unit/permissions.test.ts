import { describe, it, expect } from 'vitest'
import { can, ACTIONS } from '@/domain/permissions'
import { ROLES } from '@/domain/roles'

describe('can()', () => {
  it('FOUNDER_ADMIN puede todo sin restriccion de alcance', () => {
    for (const action of ACTIONS) {
      expect(can({ globalRole: 'FOUNDER_ADMIN', action })).toBe('all')
    }
  })

  it('solo FOUNDER_ADMIN puede eliminar permanentemente', () => {
    for (const role of ROLES) {
      const scope = can({ globalRole: role, action: 'project.purge' })
      if (role === 'FOUNDER_ADMIN') expect(scope).toBe('all')
      else expect(scope).toBe('none')
    }
  })

  it('solo FOUNDER_ADMIN puede gestionar usuarios', () => {
    for (const role of ROLES) {
      const scope = can({ globalRole: role, action: 'user.manage' })
      if (role === 'FOUNDER_ADMIN') expect(scope).toBe('all')
      else expect(scope).toBe('none')
    }
  })

  it('COLLABORATOR solo lee clientes de proyectos donde es miembro', () => {
    expect(can({ globalRole: 'COLLABORATOR', action: 'client.read' })).toBe('member')
  })

  it('VIEWER no accede a oportunidades', () => {
    expect(can({ globalRole: 'VIEWER', action: 'opportunity.read' })).toBe('none')
  })

  it('CLIENT no accede a oportunidades', () => {
    expect(can({ globalRole: 'CLIENT', action: 'opportunity.read' })).toBe('none')
  })

  it('el rol de proyecto eleva al global cuando es mas permisivo', () => {
    expect(
      can({ globalRole: 'VIEWER', projectRole: 'PROJECT_MANAGER', action: 'project.update' }),
    ).toBe('member')
  })

  it('el rol de proyecto nunca degrada al global', () => {
    expect(
      can({ globalRole: 'FOUNDER_ADMIN', projectRole: 'VIEWER', action: 'project.purge' }),
    ).toBe('all')
  })

  it('ninguna combinacion de roles concede purge salvo FOUNDER_ADMIN global', () => {
    for (const globalRole of ROLES) {
      for (const projectRole of ROLES) {
        const scope = can({ globalRole, projectRole, action: 'project.purge' })
        if (globalRole === 'FOUNDER_ADMIN') expect(scope).toBe('all')
        else expect(scope).toBe('none')
      }
    }
  })

  it('cada combinacion de rol y accion devuelve un scope definido', () => {
    for (const role of ROLES) {
      for (const action of ACTIONS) {
        expect(can({ globalRole: role, action })).toBeDefined()
      }
    }
  })
})
