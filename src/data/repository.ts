import type { TaskStatus } from '@/domain/progress'
import type {
  Client,
  Contact,
  Meeting,
  MeetingAttendee,
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

  listProjects(): Promise<Project[]>
  getProjectWithPhases(id: string): Promise<ProjectWithPhases | null>
  listProjectsWithPhases(): Promise<ProjectWithPhases[]>

  listMeetings(): Promise<Meeting[]>
  createMeeting(input: NewMeetingInput): Promise<Meeting>

  /** Devuelve la tarea actualizada, o null si no existe o la transicion es invalida. */
  moveTask(taskId: string, status: TaskStatus): Promise<Task | null>
}
