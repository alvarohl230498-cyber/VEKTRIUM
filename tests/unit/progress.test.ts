import { describe, it, expect } from 'vitest'
import { calculateProgress, type ProgressTask } from '@/domain/progress'

const t = (weight: number, status: ProgressTask['status']): ProgressTask => ({ weight, status })

describe('calculateProgress()', () => {
  it('devuelve 0 si no hay tareas', () => {
    expect(calculateProgress([])).toBe(0)
  })

  it('devuelve 0 si ninguna tarea esta completada', () => {
    expect(calculateProgress([t(1, 'pendiente'), t(3, 'en_progreso')])).toBe(0)
  })

  it('devuelve 1 si todas estan completadas', () => {
    expect(calculateProgress([t(1, 'completada'), t(5, 'completada')])).toBe(1)
  })

  it('pondera por peso, no por conteo', () => {
    // 9 de 10 puntos completados, pero solo 1 de 2 tareas.
    expect(calculateProgress([t(9, 'completada'), t(1, 'pendiente')])).toBe(0.9)
  })

  it('excluye las tareas canceladas del denominador', () => {
    // 1 completada de peso 1, 1 cancelada de peso 99 -> 100%.
    expect(calculateProgress([t(1, 'completada'), t(99, 'cancelada')])).toBe(1)
  })

  it('devuelve 0 si todas las tareas estan canceladas', () => {
    expect(calculateProgress([t(5, 'cancelada'), t(5, 'cancelada')])).toBe(0)
  })

  it('ignora pesos no positivos tratandolos como 1', () => {
    expect(calculateProgress([t(0, 'completada'), t(0, 'pendiente')])).toBe(0.5)
  })

  it('no acumula error de coma flotante en tercios', () => {
    const tasks = [t(1, 'completada'), t(1, 'pendiente'), t(1, 'pendiente')]
    expect(calculateProgress(tasks)).toBeCloseTo(1 / 3, 10)
  })
})
