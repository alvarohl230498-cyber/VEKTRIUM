import type { TaskStatus } from '@/domain/progress'
import type { DomainError, Result } from '@/domain/result'
import type { OpportunityStatus } from '@/domain/state-machines'
import type {
  Client,
  Contact,
  Meeting,
  MeetingAttendee,
  MeetingSyncStatus,
  Opportunity,
  Project,
  ProjectWithPhases,
  Task,
  User,
} from './types'

export type NewClientInput = Omit<Client, 'id' | 'isIllustrative' | 'createdAt'>

export type NewMeetingInput = Omit<Meeting, 'id' | 'isIllustrative' | 'attendees'> & {
  attendees: MeetingAttendee[]
}

export interface MeetingSyncPatch {
  syncStatus: MeetingSyncStatus
  syncError?: string | null
  meetUrl?: string | null
  providerEventId?: string | null
  isMock?: boolean
}

export interface ConvertOpportunityInput {
  name: string
  ownerId: string
  startDate: string
  targetDate: string
}

export interface NewOpportunityInput {
  clientId: string
  title: string
  expectedAmount: number
  ownerId: string
}

/**
 * Contrato de acceso a datos para el portal. Hoy lo implementa
 * src/data/memory/store.ts. Cuando exista el proyecto Supabase, una
 * implementacion respaldada por src/db (Drizzle + RLS) satisface el mismo
 * contrato sin que ninguna pantalla cambie.
 */
export interface VektriumRepository {
  listUsers(): Promise<User[]>
  getUserById(id: string): Promise<User | null>

  listClients(): Promise<Client[]>
  getClientById(id: string): Promise<Client | null>
  listContactsByClient(clientId: string): Promise<Contact[]>
  createClient(input: NewClientInput): Promise<Client>

  listOpportunities(): Promise<Opportunity[]>
  getOpportunityById(id: string): Promise<Opportunity | null>
  createOpportunity(input: NewOpportunityInput): Promise<Opportunity>

  /**
   * Aplica transitionOpportunity() del dominio y persiste si es valida.
   * Devuelve null si la oportunidad no existe; un Result de error si la
   * transicion es invalida o falta el motivo de perdida.
   */
  updateOpportunityStatus(
    id: string,
    to: OpportunityStatus,
    ctx: { lossReason?: string },
  ): Promise<Result<Opportunity, DomainError> | null>

  /**
   * Crea un proyecto a partir de una oportunidad, le aplica las 9 fases de
   * buildPhasesForProject() y marca la oportunidad como 'ganado' SIN
   * eliminarla. Devuelve null si la oportunidad no existe; un Result de
   * error si la transicion a 'ganado' es invalida desde el estado actual.
   */
  convertOpportunityToProject(
    opportunityId: string,
    input: ConvertOpportunityInput,
  ): Promise<Result<ProjectWithPhases, DomainError> | null>

  listProjects(): Promise<Project[]>
  getProjectWithPhases(id: string): Promise<ProjectWithPhases | null>
  listProjectsWithPhases(): Promise<ProjectWithPhases[]>

  listMeetings(): Promise<Meeting[]>
  createMeeting(input: NewMeetingInput): Promise<Meeting>
  /** Devuelve la reunion actualizada, o null si no existe. */
  updateMeetingStatus(id: string, patch: MeetingSyncPatch): Promise<Meeting | null>
  /**
   * Reemplaza las notas de una reunion. Sin versionado: la ultima escritura
   * gana. Devuelve la reunion actualizada, o null si no existe.
   */
  updateMeetingNotes(id: string, notes: string): Promise<Meeting | null>

  /** Devuelve la tarea actualizada, o null si no existe o la transicion es invalida. */
  moveTask(taskId: string, status: TaskStatus): Promise<Task | null>
}
