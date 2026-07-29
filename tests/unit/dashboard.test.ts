import { describe, expect, it } from 'vitest'
import { getAttentionItems, getUpcomingMeetings, summarizePortfolio } from '@/lib/dashboard'
import type { Client, Meeting, Opportunity, Project, Task, User } from '@/data'

const now = new Date('2026-07-29T15:00:00.000Z')

const users: User[] = [{ id: 'u1', email: 'u1@vektrium.pe', fullName: 'Usuario Uno', role: 'FOUNDER_ADMIN' }]

const clients: Client[] = [
  {
    id: 'c1',
    legalName: 'Cliente Uno S.A.C.',
    tradeName: 'Cliente Uno',
    ruc: null,
    industry: 'Tecnologia',
    size: 'micro',
    city: 'Lima',
    country: 'Peru',
    confidentiality: 'interno',
    createdAt: now.toISOString(),
    isIllustrative: true,
  },
]

function iso(daysFromNow: number): string {
  return new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
}

describe('summarizePortfolio', () => {
  const projects: Project[] = [
    {
      id: 'p1',
      code: 'VK-0001',
      clientId: 'c1',
      opportunityId: null,
      name: 'Proyecto activo sano',
      status: 'activo',
      health: 'sano',
      healthReason: null,
      ownerId: 'u1',
      startDate: iso(-10),
      targetDate: iso(20),
      archivedAt: null,
      isIllustrative: true,
    },
    {
      id: 'p2',
      code: 'VK-0002',
      clientId: 'c1',
      opportunityId: null,
      name: 'Proyecto en riesgo',
      status: 'activo',
      health: 'en_riesgo',
      healthReason: 'Retraso',
      ownerId: 'u1',
      startDate: iso(-10),
      targetDate: iso(20),
      archivedAt: null,
      isIllustrative: true,
    },
    {
      id: 'p3',
      code: 'VK-0003',
      clientId: 'c1',
      opportunityId: null,
      name: 'Proyecto archivado',
      status: 'archivado',
      health: 'sano',
      healthReason: null,
      ownerId: 'u1',
      startDate: iso(-100),
      targetDate: iso(-50),
      archivedAt: iso(-40),
      isIllustrative: true,
    },
  ]

  const opportunities: Opportunity[] = [
    {
      id: 'o1',
      clientId: 'c1',
      title: 'Oportunidad abierta',
      status: 'en_negociacion',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: iso(-10),
      updatedAt: iso(-1),
      isIllustrative: true,
    },
    {
      id: 'o2',
      clientId: 'c1',
      title: 'Oportunidad ganada',
      status: 'ganado',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: iso(-30),
      updatedAt: iso(-20),
      isIllustrative: true,
    },
  ]

  const tasks: Task[] = [
    {
      id: 't1',
      projectId: 'p1',
      phaseId: 'ph1',
      title: 'Tarea de esta semana',
      status: 'pendiente',
      weight: 1,
      assigneeId: 'u1',
      dueDate: iso(3),
      completedAt: null,
      isIllustrative: true,
    },
    {
      id: 't2',
      projectId: 'p1',
      phaseId: 'ph1',
      title: 'Tarea completada esta semana',
      status: 'completada',
      weight: 1,
      assigneeId: 'u1',
      dueDate: iso(2),
      completedAt: iso(1),
      isIllustrative: true,
    },
    {
      id: 't3',
      projectId: 'p1',
      phaseId: 'ph1',
      title: 'Tarea lejana',
      status: 'pendiente',
      weight: 1,
      assigneeId: 'u1',
      dueDate: iso(30),
      completedAt: null,
      isIllustrative: true,
    },
  ]

  it('cuenta proyectos activos, en riesgo, oportunidades abiertas y entregas de la semana', () => {
    const summary = summarizePortfolio({ projects, opportunities, tasks, now })

    expect(summary.activeProjects).toBe(2)
    expect(summary.atRiskProjects).toBe(1)
    expect(summary.openOpportunities).toBe(1)
    expect(summary.dueThisWeek).toBe(1)
  })
})

describe('getAttentionItems', () => {
  const tasks: Task[] = [
    {
      id: 't-vencida',
      projectId: 'p1',
      phaseId: 'ph1',
      title: 'Tarea vencida',
      status: 'en_progreso',
      weight: 1,
      assigneeId: 'u1',
      dueDate: iso(-2),
      completedAt: null,
      isIllustrative: true,
    },
    {
      id: 't-cancelada-vencida',
      projectId: 'p1',
      phaseId: 'ph1',
      title: 'Tarea cancelada con fecha pasada',
      status: 'cancelada',
      weight: 1,
      assigneeId: 'u1',
      dueDate: iso(-2),
      completedAt: null,
      isIllustrative: true,
    },
  ]

  const meetings: Meeting[] = [
    {
      id: 'm-sin-minuta',
      clientId: 'c1',
      projectId: null,
      type: 'diagnostico',
      title: 'Reunion pasada sin minuta',
      startsAt: iso(-3),
      endsAt: iso(-3),
      organizerId: 'u1',
      isMock: true,
      meetUrl: 'https://meet.vektrium.dev/mock/x',
      syncStatus: 'sincronizada',
      hasMinutes: false,
      attendees: [],
      isIllustrative: true,
    },
    {
      id: 'm-futura-sin-minuta',
      clientId: 'c1',
      projectId: null,
      type: 'diagnostico',
      title: 'Reunion futura sin minuta (no aplica todavia)',
      startsAt: iso(3),
      endsAt: iso(3),
      organizerId: 'u1',
      isMock: true,
      meetUrl: null,
      syncStatus: 'pendiente',
      hasMinutes: false,
      attendees: [],
      isIllustrative: true,
    },
  ]

  const opportunities: Opportunity[] = [
    {
      id: 'o-sin-seguimiento',
      clientId: 'c1',
      title: 'Propuesta sin seguimiento',
      status: 'propuesta_enviada',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: iso(-30),
      updatedAt: iso(-20),
      isIllustrative: true,
    },
    {
      id: 'o-seguimiento-reciente',
      clientId: 'c1',
      title: 'Propuesta con seguimiento reciente',
      status: 'propuesta_enviada',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: iso(-30),
      updatedAt: iso(-1),
      isIllustrative: true,
    },
  ]

  it('incluye tareas vencidas activas, excluye canceladas, e incluye reuniones pasadas sin minuta y propuestas estancadas', () => {
    const items = getAttentionItems({ tasks, meetings, opportunities, users, clients, now })
    const ids = items.map((i) => i.id)

    expect(ids).toContain('task-t-vencida')
    expect(ids).not.toContain('task-t-cancelada-vencida')
    expect(ids).toContain('meeting-m-sin-minuta')
    expect(ids).not.toContain('meeting-m-futura-sin-minuta')
    expect(ids).toContain('opportunity-o-sin-seguimiento')
    expect(ids).not.toContain('opportunity-o-seguimiento-reciente')
  })
})

describe('getUpcomingMeetings', () => {
  const meetings: Meeting[] = [
    {
      id: 'm-pasada',
      clientId: 'c1',
      projectId: null,
      type: 'seguimiento',
      title: 'Reunion pasada',
      startsAt: iso(-1),
      endsAt: iso(-1),
      organizerId: 'u1',
      isMock: true,
      meetUrl: null,
      syncStatus: 'sincronizada',
      hasMinutes: true,
      attendees: [],
      isIllustrative: true,
    },
    {
      id: 'm-futura-lejos',
      clientId: 'c1',
      projectId: null,
      type: 'seguimiento',
      title: 'Reunion futura lejana',
      startsAt: iso(10),
      endsAt: iso(10),
      organizerId: 'u1',
      isMock: true,
      meetUrl: null,
      syncStatus: 'pendiente',
      hasMinutes: false,
      attendees: [],
      isIllustrative: true,
    },
    {
      id: 'm-futura-cerca',
      clientId: 'c1',
      projectId: null,
      type: 'diagnostico',
      title: 'Reunion futura cercana',
      startsAt: iso(2),
      endsAt: iso(2),
      organizerId: 'u1',
      isMock: true,
      meetUrl: 'https://meet.vektrium.dev/mock/y',
      syncStatus: 'pendiente',
      hasMinutes: false,
      attendees: [],
      isIllustrative: true,
    },
  ]

  it('devuelve solo reuniones futuras ordenadas por fecha', () => {
    const upcoming = getUpcomingMeetings({ meetings, clients, now })

    expect(upcoming.map((m) => m.id)).toEqual(['m-futura-cerca', 'm-futura-lejos'])
  })
})
