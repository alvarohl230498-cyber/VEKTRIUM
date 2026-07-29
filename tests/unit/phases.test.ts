import { describe, it, expect } from 'vitest'
import { VEKTRIUM_PHASES, buildPhasesForProject } from '@/domain/phases'

describe('plantilla de fases VEKTRIUM', () => {
  it('tiene exactamente 9 fases', () => {
    expect(VEKTRIUM_PHASES).toHaveLength(9)
  })

  it('esta ordenada de 0 a 8 sin huecos', () => {
    expect(VEKTRIUM_PHASES.map((p) => p.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('empieza en calificacion y termina en seguimiento postentrega', () => {
    expect(VEKTRIUM_PHASES[0]?.name).toBe('Calificación y preparación')
    expect(VEKTRIUM_PHASES[8]?.name).toBe('Seguimiento postentrega')
  })

  it('asigna peso 1 por defecto a todas las fases', () => {
    expect(VEKTRIUM_PHASES.every((p) => p.weight === 1)).toBe(true)
  })

  it('buildPhasesForProject asocia todas las fases al proyecto dado', () => {
    const phases = buildPhasesForProject('proj-123')
    expect(phases).toHaveLength(9)
    expect(phases.every((p) => p.projectId === 'proj-123')).toBe(true)
  })

  it('buildPhasesForProject devuelve copias, no la plantilla compartida', () => {
    const a = buildPhasesForProject('proj-a')
    const b = buildPhasesForProject('proj-b')
    expect(a[0]).not.toBe(b[0])
    expect(a[0]?.projectId).toBe('proj-a')
  })
})
