import type { Meeting, ProjectPhaseWithTasks, Task } from '@/data'
import { calculateProgress } from '@/domain/progress'

/**
 * Funciones puras para la ficha de proyecto (pestaña Resumen). Sin I/O, para
 * poder probarlas sin levantar Next ni la capa de datos.
 */

const CLOSED_TASK_STATUSES = new Set<Task['status']>(['completada', 'cancelada'])
const PRIORITY_TASK_STATUSES = new Set<Task['status']>(['bloqueada', 'en_revision', 'esperando_cliente'])

export interface PhaseProgress {
  phaseId: string
  name: string
  order: number
  progress: number
}

export function computePhaseProgress(phases: ProjectPhaseWithTasks[]): PhaseProgress[] {
  return [...phases]
    .sort((a, b) => a.order - b.order)
    .map((phase) => ({
      phaseId: phase.id,
      name: phase.name,
      order: phase.order,
      progress: Math.round(calculateProgress(phase.tasks) * 100),
    }))
}

/** La primera fase (en orden) que todavía no está completa. */
export function computeNextMilestone(phases: ProjectPhaseWithTasks[]): ProjectPhaseWithTasks | null {
  const sorted = [...phases].sort((a, b) => a.order - b.order)
  return (
    sorted.find((phase) => phase.tasks.some((t) => !CLOSED_TASK_STATUSES.has(t.status))) ??
    sorted.find((phase) => phase.tasks.length === 0) ??
    null
  )
}

export function computeNextMeeting(meetings: Meeting[], projectId: string, now: Date): Meeting | null {
  const upcoming = meetings
    .filter((m) => m.projectId === projectId && new Date(m.startsAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  return upcoming[0] ?? null
}

/** Tareas vencidas o en un estado que exige atencion (bloqueada, en revision, esperando al cliente). */
export function computePriorityTasks(tasks: Task[], now: Date): Task[] {
  return tasks
    .filter((task) => {
      if (CLOSED_TASK_STATUSES.has(task.status)) return false
      if (PRIORITY_TASK_STATUSES.has(task.status)) return true
      return task.dueDate !== null && new Date(task.dueDate).getTime() < now.getTime()
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
}
