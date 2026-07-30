import type { Client, Meeting, Opportunity, Project, Task, User } from '@/data'

/**
 * Funciones puras que arman los tres bloques del dashboard a partir de datos
 * ya leidos del repositorio. Sin I/O aqui a proposito: se pueden probar sin
 * levantar Next ni la capa de datos.
 */

export const OPEN_OPPORTUNITY_STATUSES: ReadonlySet<Opportunity['status']> = new Set([
  'nuevo_lead',
  'contactado',
  'diagnostico_agendado',
  'diagnostico_realizado',
  'preparando_propuesta',
  'propuesta_enviada',
  'en_negociacion',
])

const CLOSED_TASK_STATUSES: ReadonlySet<Task['status']> = new Set(['completada', 'cancelada'])

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const STALE_PROPOSAL_MS = 14 * 24 * 60 * 60 * 1000

export interface PortfolioSummary {
  activeProjects: number
  atRiskProjects: number
  openOpportunities: number
  dueThisWeek: number
}

export function summarizePortfolio(params: {
  projects: Project[]
  opportunities: Opportunity[]
  tasks: Task[]
  now?: Date
}): PortfolioSummary {
  const now = params.now ?? new Date()
  const weekEnd = now.getTime() + WEEK_MS

  const activeProjects = params.projects.filter((p) => p.status === 'activo')

  return {
    activeProjects: activeProjects.length,
    atRiskProjects: activeProjects.filter((p) => p.health !== 'sano').length,
    openOpportunities: params.opportunities.filter((o) => OPEN_OPPORTUNITY_STATUSES.has(o.status)).length,
    dueThisWeek: params.tasks.filter((t) => {
      if (!t.dueDate || CLOSED_TASK_STATUSES.has(t.status)) return false
      const due = new Date(t.dueDate).getTime()
      return due >= now.getTime() && due <= weekEnd
    }).length,
  }
}

export type AttentionKind = 'tarea_vencida' | 'reunion_sin_minuta' | 'propuesta_sin_seguimiento'

export interface AttentionItem {
  id: string
  kind: AttentionKind
  title: string
  reason: string
}

function userLabel(userId: string | null, users: User[]): string {
  if (!userId) return 'sin asignar'
  return users.find((u) => u.id === userId)?.fullName ?? 'sin asignar'
}

function clientLabel(clientId: string, clients: Client[]): string {
  return clients.find((c) => c.id === clientId)?.tradeName ?? 'cliente desconocido'
}

export function getAttentionItems(params: {
  tasks: Task[]
  meetings: Meeting[]
  opportunities: Opportunity[]
  users: User[]
  clients: Client[]
  now?: Date
}): AttentionItem[] {
  const now = params.now ?? new Date()
  const items: AttentionItem[] = []

  for (const task of params.tasks) {
    if (!task.dueDate || CLOSED_TASK_STATUSES.has(task.status)) continue
    const due = new Date(task.dueDate)
    if (due.getTime() >= now.getTime()) continue

    items.push({
      id: `task-${task.id}`,
      kind: 'tarea_vencida',
      title: task.title,
      reason: `Vencida el ${formatLima(due)} · asignada a ${userLabel(task.assigneeId, params.users)}.`,
    })
  }

  for (const meeting of params.meetings) {
    if (meeting.hasMinutes) continue
    const startsAt = new Date(meeting.startsAt)
    if (startsAt.getTime() >= now.getTime()) continue

    items.push({
      id: `meeting-${meeting.id}`,
      kind: 'reunion_sin_minuta',
      title: meeting.title,
      reason: `Reunion del ${formatLima(startsAt)} con ${clientLabel(meeting.clientId, params.clients)} sin minuta registrada.`,
    })
  }

  for (const opportunity of params.opportunities) {
    if (opportunity.status !== 'propuesta_enviada') continue
    const updatedAt = new Date(opportunity.updatedAt)
    const idleMs = now.getTime() - updatedAt.getTime()
    if (idleMs < STALE_PROPOSAL_MS) continue

    const idleDays = Math.floor(idleMs / (24 * 60 * 60 * 1000))
    items.push({
      id: `opportunity-${opportunity.id}`,
      kind: 'propuesta_sin_seguimiento',
      title: opportunity.title,
      reason: `Propuesta enviada a ${clientLabel(opportunity.clientId, params.clients)} hace ${idleDays} dias, sin seguimiento registrado.`,
    })
  }

  return items
}

export interface UpcomingMeeting {
  id: string
  title: string
  clientName: string
  type: Meeting['type']
  startsAt: string
  isMock: boolean
  meetUrl: string | null
}

export function getUpcomingMeetings(params: {
  meetings: Meeting[]
  clients: Client[]
  now?: Date
  limit?: number
}): UpcomingMeeting[] {
  const now = params.now ?? new Date()
  const limit = params.limit ?? 5

  return params.meetings
    .filter((m) => new Date(m.startsAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, limit)
    .map((m) => ({
      id: m.id,
      title: m.title,
      clientName: clientLabel(m.clientId, params.clients),
      type: m.type,
      startsAt: m.startsAt,
      isMock: m.isMock,
      meetUrl: m.meetUrl,
    }))
}

export function formatLima(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatLimaDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
