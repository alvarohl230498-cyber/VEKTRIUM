import type { ClientConfidentiality, ClientSize, ProjectHealth, ProjectStatus } from '@/data'
import type { TaskStatus } from '@/domain/progress'
import type { OpportunityStatus } from '@/domain/state-machines'

/** Rótulos en español, en un solo lugar, para que ninguna pantalla invente los suyos. */

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  nuevo_lead: 'Nuevo lead',
  contactado: 'Contactado',
  diagnostico_agendado: 'Diagnóstico agendado',
  diagnostico_realizado: 'Diagnóstico realizado',
  preparando_propuesta: 'Preparando propuesta',
  propuesta_enviada: 'Propuesta enviada',
  en_negociacion: 'En negociación',
  ganado: 'Ganado',
  no_aceptado: 'No aceptado',
  sin_respuesta: 'Sin respuesta',
  pospuesto: 'Pospuesto',
  descalificado: 'Descalificado',
  archivado: 'Archivado',
}

/** Orden de columnas del Kanban de oportunidades. */
export const OPPORTUNITY_KANBAN_ORDER: OpportunityStatus[] = [
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
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  lista_para_iniciar: 'Lista para iniciar',
  en_progreso: 'En progreso',
  en_revision: 'En revisión',
  bloqueada: 'Bloqueada',
  esperando_cliente: 'Esperando al cliente',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

export const TASK_KANBAN_ORDER: TaskStatus[] = [
  'pendiente',
  'lista_para_iniciar',
  'en_progreso',
  'en_revision',
  'bloqueada',
  'esperando_cliente',
  'completada',
  'cancelada',
]

export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  sano: 'Sano',
  en_riesgo: 'En riesgo',
  critico: 'Crítico',
}

export const PROJECT_HEALTH_ICON: Record<ProjectHealth, string> = {
  sano: '●',
  en_riesgo: '▲',
  critico: '■',
}

export const PROJECT_HEALTH_TEXT_CLASS: Record<ProjectHealth, string> = {
  sano: 'text-vk-success',
  en_riesgo: 'text-vk-warning',
  critico: 'text-vk-danger',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  activo: 'Activo',
  archivado: 'Archivado',
}

export const CLIENT_SIZE_LABELS: Record<ClientSize, string> = {
  micro: 'Micro',
  pequena: 'Pequeña',
  mediana: 'Mediana',
  grande: 'Grande',
}

export const CLIENT_CONFIDENTIALITY_LABELS: Record<ClientConfidentiality, string> = {
  publico: 'Público',
  interno: 'Interno',
  confidencial: 'Confidencial',
}
