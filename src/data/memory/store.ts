import { randomUUID } from 'node:crypto'
import { buildPhasesForProject } from '@/domain/phases'
import type { TaskStatus } from '@/domain/progress'
import { err, ok } from '@/domain/result'
import { transitionOpportunity, transitionTask } from '@/domain/state-machines'
import type {
  ConvertOpportunityInput,
  MeetingSyncPatch,
  NewClientInput,
  NewMeetingInput,
  NewOpportunityInput,
  VektriumRepository,
} from '../repository'
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

/** Siguiente codigo secuencial VK-0001, VK-0002... a partir de los existentes. */
function nextProjectCode(projects: Project[]): string {
  const max = projects.reduce((acc, p) => {
    const match = /^VK-(\d+)$/.exec(p.code)
    if (!match || !match[1]) return acc
    return Math.max(acc, Number(match[1]))
  }, 0)
  return `VK-${String(max + 1).padStart(4, '0')}`
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

    async createOpportunity(input: NewOpportunityInput) {
      const now = new Date().toISOString()
      const opportunity: Opportunity = {
        id: `opp-${randomUUID()}`,
        clientId: input.clientId,
        title: input.title,
        status: 'nuevo_lead',
        lossReason: null,
        expectedAmount: input.expectedAmount,
        ownerId: input.ownerId,
        createdAt: now,
        updatedAt: now,
      }
      state.opportunities.push(opportunity)
      return clone(opportunity)
    },

    async updateOpportunityStatus(id, to, ctx) {
      const opportunity = state.opportunities.find((o) => o.id === id)
      if (!opportunity) return null

      const result = transitionOpportunity(opportunity.status, to, ctx)
      if (!result.ok) return err(result.error)

      opportunity.status = result.value
      opportunity.updatedAt = new Date().toISOString()
      if (result.value === 'no_aceptado' && ctx.lossReason) {
        opportunity.lossReason = ctx.lossReason
      }
      return ok(clone(opportunity))
    },

    async convertOpportunityToProject(opportunityId, input: ConvertOpportunityInput) {
      const opportunity = state.opportunities.find((o) => o.id === opportunityId)
      if (!opportunity) return null

      if (opportunity.status !== 'ganado') {
        const result = transitionOpportunity(opportunity.status, 'ganado', {})
        if (!result.ok) return err(result.error)
      }

      const projectId = `project-${randomUUID()}`
      const templates = buildPhasesForProject(projectId)
      const phases: ProjectPhaseWithTasks[] = templates.map((t) => ({
        id: `${projectId}-phase-${t.order}`,
        projectId: t.projectId,
        order: t.order,
        name: t.name,
        description: t.description,
        weight: t.weight,
        plannedStart: null,
        plannedEnd: null,
        tasks: [],
      }))
      const firstPhase = phases.find((p) => p.order === 0)
      if (!firstPhase) throw new Error('La plantilla de fases no genero una fase de orden 0.')

      const project: Project = {
        id: projectId,
        code: nextProjectCode(state.projects),
        clientId: opportunity.clientId,
        opportunityId: opportunity.id,
        name: input.name,
        status: 'activo',
        health: 'sano',
        healthReason: null,
        ownerId: input.ownerId,
        startDate: input.startDate,
        targetDate: input.targetDate,
        currentPhaseId: firstPhase.id,
        archivedAt: null,
      }
      state.projects.push(project)
      state.phases.push(...phases)

      opportunity.status = 'ganado'
      opportunity.updatedAt = new Date().toISOString()

      return ok(projectWithPhases(project))
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

    async updateMeetingStatus(id: string, patch: MeetingSyncPatch) {
      const meeting = state.meetings.find((m) => m.id === id)
      if (!meeting) return null

      meeting.syncStatus = patch.syncStatus
      if (patch.syncError !== undefined) meeting.syncError = patch.syncError
      if (patch.meetUrl !== undefined) meeting.meetUrl = patch.meetUrl
      if (patch.providerEventId !== undefined) meeting.providerEventId = patch.providerEventId
      if (patch.isMock !== undefined) meeting.isMock = patch.isMock

      return clone(meeting)
    },

    async updateMeetingNotes(id: string, notes: string) {
      const meeting = state.meetings.find((m) => m.id === id)
      if (!meeting) return null

      meeting.notes = notes
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

    async moveProjectPhase(projectId: string, phaseId: string) {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return null

      const belongsToProject = state.phases.some((p) => p.id === phaseId && p.projectId === projectId)
      if (!belongsToProject) return null

      project.currentPhaseId = phaseId
      return clone(project)
    },
  }
}
