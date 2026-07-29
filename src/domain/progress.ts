export const TASK_STATUSES = [
  'pendiente',
  'lista_para_iniciar',
  'en_progreso',
  'en_revision',
  'bloqueada',
  'esperando_cliente',
  'completada',
  'cancelada',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface ProgressTask {
  weight: number
  status: TaskStatus
}

/** Un peso no positivo carece de sentido de negocio; se normaliza a 1. */
function effectiveWeight(weight: number): number {
  return weight > 0 ? weight : 1
}

/**
 * Avance = suma de pesos completados / suma de pesos no cancelados.
 * Devuelve un valor entre 0 y 1. Las canceladas no cuentan en ningun lado.
 */
export function calculateProgress(tasks: readonly ProgressTask[]): number {
  const active = tasks.filter((t) => t.status !== 'cancelada')
  if (active.length === 0) return 0

  const total = active.reduce((sum, t) => sum + effectiveWeight(t.weight), 0)
  const done = active
    .filter((t) => t.status === 'completada')
    .reduce((sum, t) => sum + effectiveWeight(t.weight), 0)

  return done / total
}
