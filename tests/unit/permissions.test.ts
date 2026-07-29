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

  it('CLIENT sin rol de proyecto solo lee reuniones donde es asistente', () => {
    expect(can({ globalRole: 'CLIENT', action: 'meeting.read' })).toBe('assignee')
  })

  it('un CLIENT ascendido a COLLABORATOR en un proyecto si eleva su alcance', () => {
    // La elevacion por rol de proyecto es deliberada: anadir a un cliente como
    // colaborador de un proyecto le concede visibilidad de colaborador ahi.
    // Que un cliente no vea reuniones internas NO se resuelve en esta matriz;
    // requiere una marca is_internal en la reunion, aun inexistente.
    expect(
      can({ globalRole: 'CLIENT', projectRole: 'COLLABORATOR', action: 'meeting.read' }),
    ).toBe('member')
  })

  it('phase.read es member para todos los roles con membresia de proyecto', () => {
    const membershipRoles: readonly string[] = ['VIEWER', 'CLIENT', 'COLLABORATOR', 'PROJECT_MANAGER']
    for (const role of ROLES) {
      if (!membershipRoles.includes(role)) continue
      expect(can({ globalRole: role, action: 'phase.read' })).toBe('member')
    }
  })
})
