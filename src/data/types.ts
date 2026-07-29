import type { Role } from '@/domain/roles'
import type { TaskStatus } from '@/domain/progress'
import type { OpportunityStatus } from '@/domain/state-machines'

/**
 * Toda entidad sembrada con datos ficticios lleva esta marca para que la UI
 * pueda mostrar la insignia obligatoria "Dato ilustrativo". Es una regla de
 * negocio no negociable del brief: ninguna cifra ficticia se muestra sin ella.
 * Opcional a proposito: un registro creado de verdad por un usuario (import
 * CSV, alta manual) no debe declararse ficticio solo por omision del campo.
 */
export interface Illustrative {
  isIllustrative?: true
}

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
}

export type ClientConfidentiality = 'publico' | 'interno' | 'confidencial'
export type ClientSize = 'micro' | 'pequena' | 'mediana' | 'grande'

export interface Client extends Illustrative {
  id: string
  legalName: string
  tradeName: string | null
  ruc: string | null
  industry: string
  size: ClientSize
  city: string
  country: string
  confidentiality: ClientConfidentiality
  createdAt: string
}

export interface Contact extends Illustrative {
  id: string
  clientId: string
  fullName: string
  position: string
  email: string
  phone: string | null
  isPrimary: boolean
}

export interface Opportunity extends Illustrative {
  id: string
  clientId: string
  title: string
  status: OpportunityStatus
  lossReason: string | null
  expectedAmount: number
  ownerId: string
  createdAt: string
  updatedAt: string
}

export type ProjectHealth = 'sano' | 'en_riesgo' | 'critico'
export type ProjectStatus = 'activo' | 'archivado'

export interface Project extends Illustrative {
  id: string
  code: string
  clientId: string
  opportunityId: string | null
  name: string
  status: ProjectStatus
  health: ProjectHealth
  healthReason: string | null
  ownerId: string
  startDate: string
  targetDate: string
  archivedAt: string | null
}

export interface ProjectPhase extends Illustrative {
  id: string
  projectId: string
  order: number
  name: string
  description: string
  weight: number
  plannedStart: string | null
  plannedEnd: string | null
}

export interface Task extends Illustrative {
  id: string
  projectId: string
  phaseId: string
  title: string
  status: TaskStatus
  weight: number
  assigneeId: string | null
  dueDate: string | null
  completedAt: string | null
}

export type MeetingType = 'diagnostico' | 'validacion' | 'seguimiento' | 'interna'
export type MeetingSyncStatus = 'pendiente' | 'sincronizada' | 'fallida'
export type AttendeeResponse = 'pendiente' | 'aceptado' | 'declinado'

export interface MeetingAttendee {
  userId: string | null
  contactId: string | null
  email: string
  fullName: string
  response: AttendeeResponse
}

export interface Meeting extends Illustrative {
  id: string
  clientId: string
  projectId: string | null
  type: MeetingType
  title: string
  startsAt: string
  endsAt: string
  organizerId: string
  isMock: boolean
  meetUrl: string | null
  syncStatus: MeetingSyncStatus
  attendees: MeetingAttendee[]
  hasMinutes: boolean
}

export interface ProjectPhaseWithTasks extends ProjectPhase {
  tasks: Task[]
}

export interface ProjectWithPhases extends Project {
  phases: ProjectPhaseWithTasks[]
}
