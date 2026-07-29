import { describe, it, expect } from 'vitest'
import { transitionOpportunity, transitionTask } from '@/domain/state-machines'

describe('transitionOpportunity()', () => {
  it('permite avanzar de nuevo_lead a contactado', () => {
    const r = transitionOpportunity('nuevo_lead', 'contactado', {})
    expect(r.ok).toBe(true)
  })

  it('rechaza un salto invalido', () => {
    const r = transitionOpportunity('nuevo_lead', 'ganado', {})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('TRANSICION_INVALIDA')
  })

  it('exige motivo de perdida al marcar no_aceptado', () => {
    const r = transitionOpportunity('propuesta_enviada', 'no_aceptado', {})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('MOTIVO_REQUERIDO')
  })

  it('acepta no_aceptado con motivo', () => {
    const r = transitionOpportunity('propuesta_enviada', 'no_aceptado', {
      lossReason: 'presupuesto_insuficiente',
    })
    expect(r.ok).toBe(true)
  })

  it('no permite salir de un estado terminal archivado', () => {
    const r = transitionOpportunity('archivado', 'contactado', {})
    expect(r.ok).toBe(false)
  })
})

describe('transitionTask()', () => {
  it('permite pasar de en_progreso a completada con criterio cumplido', () => {
    const r = transitionTask('en_progreso', 'completada', { completionCriteriaMet: true })
    expect(r.ok).toBe(true)
  })

  it('rechaza completar si el criterio de completitud no se cumple', () => {
    const r = transitionTask('en_progreso', 'completada', { completionCriteriaMet: false })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('CRITERIO_NO_CUMPLIDO')
  })

  it('permite cancelar desde cualquier estado no terminal', () => {
    expect(transitionTask('bloqueada', 'cancelada', {}).ok).toBe(true)
    expect(transitionTask('pendiente', 'cancelada', {}).ok).toBe(true)
  })

  it('no permite reabrir una tarea cancelada', () => {
    expect(transitionTask('cancelada', 'en_progreso', {}).ok).toBe(false)
  })
})
