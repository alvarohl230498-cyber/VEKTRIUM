import type { Client, Contact, Meeting, Opportunity, Project } from '@/data'
import { OPEN_OPPORTUNITY_STATUSES } from '@/lib/dashboard'

/**
 * Funciones puras para las pantallas de Clientes: sin I/O, para poder
 * probarlas sin levantar Next ni la capa de datos.
 */

export interface ClientRow {
  client: Client
  openOpportunities: number
  activeProjects: number
  lastInteractionAt: string | null
}

export function buildClientRows(params: {
  clients: Client[]
  opportunities: Opportunity[]
  projects: Project[]
  meetings: Meeting[]
}): ClientRow[] {
  return params.clients.map((client) => {
    const opportunities = params.opportunities.filter((o) => o.clientId === client.id)
    const projects = params.projects.filter((p) => p.clientId === client.id)
    const meetings = params.meetings.filter((m) => m.clientId === client.id)

    const interactionDates = [
      ...meetings.map((m) => m.startsAt),
      ...opportunities.map((o) => o.updatedAt),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    return {
      client,
      openOpportunities: opportunities.filter((o) => OPEN_OPPORTUNITY_STATUSES.has(o.status)).length,
      activeProjects: projects.filter((p) => p.status === 'activo').length,
      lastInteractionAt: interactionDates[0] ?? null,
    }
  })
}

export function uniqueIndustries(clients: Client[]): string[] {
  return Array.from(new Set(clients.map((c) => c.industry))).sort((a, b) => a.localeCompare(b, 'es'))
}

export type ActivityKind = 'oportunidad' | 'proyecto' | 'reunion'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  at: string
  title: string
  description: string
}

/** Linea de tiempo cronologica (mas reciente primero) para la ficha de cliente. */
export function buildClientActivity(params: {
  opportunities: Opportunity[]
  projects: Project[]
  meetings: Meeting[]
}): ActivityItem[] {
  const items: ActivityItem[] = [
    ...params.opportunities.map((o) => ({
      id: `opportunity-${o.id}`,
      kind: 'oportunidad' as const,
      at: o.updatedAt,
      title: o.title,
      description: `Oportunidad actualizada · estado: ${o.status}`,
    })),
    ...params.projects.map((p) => ({
      id: `project-${p.id}`,
      kind: 'proyecto' as const,
      at: p.startDate,
      title: `${p.code} · ${p.name}`,
      description: `Proyecto iniciado · estado: ${p.status}`,
    })),
    ...params.meetings.map((m) => ({
      id: `meeting-${m.id}`,
      kind: 'reunion' as const,
      at: m.startsAt,
      title: m.title,
      description: `Reunión · organizador: ${m.organizerId}`,
    })),
  ]

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export function contactsForClient(contacts: Contact[], clientId: string): Contact[] {
  return contacts.filter((c) => c.clientId === clientId)
}
