import { randomUUID } from 'node:crypto'
import type { TaskStatus } from '@/domain/progress'
import { transitionTask } from '@/domain/state-machines'
import type { NewClientInput, NewMeetingInput, VektriumRepository } from '../repository'
import type {
  Client,
  Contact,
  Meeting,
  Opportunity,
  Project,
  ProjectPhaseWithTasks,
  ProjectWithPhases,
  User,
} from '../types'
import {
  seedClients,
  seedContacts,
  seedMeetings,
  seedOpportunities,
  seedProjectPhases,
  seedProjects,
  seedUsers,
} from './seed'

/** Copia profunda para que nadie mute el estado del modulo por referencia. */
function clone<T>(value: T): T {
  return structuredClone(value)
}

interface MemoryState {
  users: User[]
  clients: Client[]
  contacts: Contact[]
  opportunities: Opportunity[]
  projects: Project[]
  phases: ProjectPhaseWithTasks[]
  meetings: Meeting[]
}

function initialState(): MemoryState {
  return {
    users: clone(seedUsers),
    clients: clone(seedClients),
    contacts: clone(seedContacts),
    opportunities: clone(seedOpportunities),
    projects: clone(seedProjects),
    phases: clone(seedProjectPhases),
    meetings: clone(seedMeetings),
  }
}

/**
 * Implementacion en memoria de VektriumRepository. Vive a nivel de modulo:
 * en `next dev` sobrevive entre peticiones (mismo proceso), y se reinicia en
 * cada arranque. No hay persistencia real — es exclusivamente el andamiaje
 * para desarrollar el portal antes de que exista un proyecto Supabase.
 */
export function createMemoryRepository(): VektriumRepository {
  const state = initialState()

  function projectWithPhases(project: Project): ProjectWithPhases {
    const phases = state.phases
      .filter((p) => p.projectId === project.id)
      .sort((a, b) => a.order - b.order)
      .map((p) => clone(p))
    return { ...clone(project), phases }
  }

  return {
    async listUsers() {
      return clone(state.users)
    },

    async getUserById(id) {
      const user = state.users.find((u) => u.id === id)
      return user ? clone(user) : null
    },

    async listClients() {
      return clone(state.clients)
    },

    async getClientById(id) {
      const client = state.clients.find((c) => c.id === id)
      return client ? clone(client) : null
    },

    async listContactsByClient(clientId) {
      return clone(state.contacts.filter((c) => c.clientId === clientId))
    },

    async createClient(input: NewClientInput) {
      const client: Client = {
        ...input,
        id: `client-${randomUUID()}`,
        createdAt: new Date().toISOString(),
      }
      state.clients.push(client)
      return clone(client)
    },

    async listOpportunities() {
      return clone(state.opportunities)
    },

    async getOpportunityById(id) {
      const opportunity = state.opportunities.find((o) => o.id === id)
      return opportunity ? clone(opportunity) : null
    },

    async listProjects() {
      return clone(state.projects)
    },

    async getProjectWithPhases(id) {
      const project = state.projects.find((p) => p.id === id)
      return project ? projectWithPhases(project) : null
    },

    async listProjectsWithPhases() {
      return state.projects.map((p) => projectWithPhases(p))
    },

    async listMeetings() {
      return clone(state.meetings)
    },

    async createMeeting(input: NewMeetingInput) {
      const meeting: Meeting = {
        ...input,
        id: `meeting-${randomUUID()}`,
      }
      state.meetings.push(meeting)
      return clone(meeting)
    },

    async moveTask(taskId: string, status: TaskStatus) {
      for (const phase of state.phases) {
        const task = phase.tasks.find((t) => t.id === taskId)
        if (!task) continue

        const result = transitionTask(task.status, status, { completionCriteriaMet: true })
        if (!result.ok) return null

        task.status = result.value
        task.completedAt = result.value === 'completada' ? new Date().toISOString() : null
        return clone(task)
      }
      return null
    },
  }
}
