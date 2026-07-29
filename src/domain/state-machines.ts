import { ok, err, type Result, type DomainError } from './result'
import type { TaskStatus } from './progress'

export const OPPORTUNITY_STATUSES = [
  'nuevo_lead',
  'contactado',
  'diagnostico_agendado',
  'diagnostico_realizado',
  'preparando_propuesta',
  'propuesta_enviada',
  'en_negociacion',
  'ganado',
  'no_aceptado',
  'sin_respuesta',
  'pospuesto',
  'descalificado',
  'archivado',
] as const

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

/** Estados desde los que se puede salir hacia una via muerta o el archivo. */
const ABANDON: readonly OpportunityStatus[] = [
  'no_aceptado',
  'sin_respuesta',
  'pospuesto',
  'descalificado',
  'archivado',
]

const OPPORTUNITY_TRANSITIONS: Record<OpportunityStatus, readonly OpportunityStatus[]> = {
  nuevo_lead: ['contactado', ...ABANDON],
  contactado: ['diagnostico_agendado', ...ABANDON],
  diagnostico_agendado: ['diagnostico_realizado', ...ABANDON],
  diagnostico_realizado: ['preparando_propuesta', ...ABANDON],
  preparando_propuesta: ['propuesta_enviada', ...ABANDON],
  propuesta_enviada: ['en_negociacion', 'ganado', ...ABANDON],
  en_negociacion: ['ganado', ...ABANDON],
  ganado: ['archivado'],
  no_aceptado: ['archivado'],
  sin_respuesta: ['contactado', 'archivado'],
  pospuesto: ['contactado', 'archivado'],
  descalificado: ['archivado'],
  archivado: [],
}

export interface OpportunityContext {
  lossReason?: string
}

export function transitionOpportunity(
  from: OpportunityStatus,
  to: OpportunityStatus,
  ctx: OpportunityContext,
): Result<OpportunityStatus, DomainError> {
  if (!OPPORTUNITY_TRANSITIONS[from].includes(to)) {
    return err({
      code: 'TRANSICION_INVALIDA',
      message: `No se puede pasar de "${from}" a "${to}".`,
    })
  }

  if (to === 'no_aceptado' && !ctx.lossReason) {
    return err({
      code: 'MOTIVO_REQUERIDO',
      message: 'Marcar una oportunidad como no aceptada exige registrar el motivo de perdida.',
    })
  }

  return ok(to)
}

const TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  pendiente: ['lista_para_iniciar', 'en_progreso', 'bloqueada', 'cancelada'],
  lista_para_iniciar: ['en_progreso', 'bloqueada', 'cancelada'],
  en_progreso: ['en_revision', 'bloqueada', 'esperando_cliente', 'completada', 'cancelada'],
  en_revision: ['en_progreso', 'completada', 'bloqueada', 'cancelada'],
  bloqueada: ['pendiente', 'en_progreso', 'cancelada'],
  esperando_cliente: ['en_progreso', 'bloqueada', 'cancelada'],
  completada: ['en_progreso'],
  cancelada: [],
}

export interface TaskContext {
  completionCriteriaMet?: boolean
}

export function transitionTask(
  from: TaskStatus,
  to: TaskStatus,
  ctx: TaskContext,
): Result<TaskStatus, DomainError> {
  if (!TASK_TRANSITIONS[from].includes(to)) {
    return err({
      code: 'TRANSICION_INVALIDA',
      message: `No se puede pasar de "${from}" a "${to}".`,
    })
  }

  if (to === 'completada' && ctx.completionCriteriaMet !== true) {
    return err({
      code: 'CRITERIO_NO_CUMPLIDO',
      message: 'La tarea no cumple su criterio de completitud.',
    })
  }

  return ok(to)
}
