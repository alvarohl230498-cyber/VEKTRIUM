import { describe, expect, it } from 'vitest'
import type { ProjectPhaseWithTasks, Task } from '@/data'
import { computeNextMilestone, computePhaseProgress, computePriorityTasks } from '@/lib/projects'

function task(overrides: Partial<Task> & Pick<Task, 'id' | 'status'>): Task {
  return {
    projectId: 'p1',
    phaseId: 'ph1',
    title: 'Tarea',
    weight: 1,
    assigneeId: null,
    dueDate: null,
    completedAt: null,
    ...overrides,
  }
}

describe('computePhaseProgress', () => {
  it('calcula el avance de cada fase de forma independiente y ordenada', () => {
    const phases: ProjectPhaseWithTasks[] = [
      {
        id: 'ph2',
        projectId: 'p1',
        order: 1,
        name: 'Fase 1',
        description: '',
        weight: 1,
        plannedStart: null,
        plannedEnd: null,
        tasks: [task({ id: 't1', status: 'completada', phaseId: 'ph2' })],
      },
      {
        id: 'ph1',
        projectId: 'p1',
        order: 0,
        name: 'Fase 0',
        description: '',
        weight: 1,
        plannedStart: null,
        plannedEnd: null,
        tasks: [
          task({ id: 't2', status: 'completada', phaseId: 'ph1' }),
          task({ id: 't3', status: 'pendiente', phaseId: 'ph1' }),
        ],
      },
    ]

    const result = computePhaseProgress(phases)
    expect(result.map((p) => p.name)).toEqual(['Fase 0', 'Fase 1'])
    expect(result[0]?.progress).toBe(50)
    expect(result[1]?.progress).toBe(100)
  })
})

describe('computeNextMilestone', () => {
  it('devuelve la primera fase en orden que aun no esta completa', () => {
    const phases: ProjectPhaseWithTasks[] = [
      {
        id: 'ph1',
        projectId: 'p1',
        order: 0,
        name: 'Fase 0',
        description: '',
        weight: 1,
        plannedStart: null,
        plannedEnd: null,
        tasks: [task({ id: 't1', status: 'completada', phaseId: 'ph1' })],
      },
      {
        id: 'ph2',
        projectId: 'p1',
        order: 1,
        name: 'Fase 1',
        description: '',
        weight: 1,
        plannedStart: null,
        plannedEnd: null,
        tasks: [task({ id: 't2', status: 'en_progreso', phaseId: 'ph2' })],
      },
    ]

    expect(computeNextMilestone(phases)?.name).toBe('Fase 1')
  })

  it('devuelve null cuando todas las fases estan completas', () => {
    const phases: ProjectPhaseWithTasks[] = [
      {
        id: 'ph1',
        projectId: 'p1',
        order: 0,
        name: 'Fase 0',
        description: '',
        weight: 1,
        plannedStart: null,
        plannedEnd: null,
        tasks: [task({ id: 't1', status: 'completada', phaseId: 'ph1' })],
      },
    ]

    expect(computeNextMilestone(phases)).toBeNull()
  })
})

describe('computePriorityTasks', () => {
  const now = new Date('2026-08-01T00:00:00.000Z')

  it('incluye tareas bloqueadas, en revision, esperando al cliente, y vencidas', () => {
    const tasks: Task[] = [
      task({ id: 't-bloqueada', status: 'bloqueada' }),
      task({ id: 't-vencida', status: 'en_progreso', dueDate: '2026-07-01T00:00:00.000Z' }),
      task({ id: 't-normal', status: 'en_progreso', dueDate: '2026-09-01T00:00:00.000Z' }),
      task({ id: 't-completada', status: 'completada', dueDate: '2026-07-01T00:00:00.000Z' }),
    ]

    const priority = computePriorityTasks(tasks, now)
    const ids = priority.map((t) => t.id)

    expect(ids).toContain('t-bloqueada')
    expect(ids).toContain('t-vencida')
    expect(ids).not.toContain('t-normal')
    expect(ids).not.toContain('t-completada')
  })
})
