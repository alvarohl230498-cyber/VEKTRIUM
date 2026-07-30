import { describe, expect, it } from 'vitest'
import type { Client, Meeting, Opportunity, Project } from '@/data'
import { buildClientActivity, buildClientRows, uniqueIndustries } from '@/lib/clients'

const client: Client = {
  id: 'c1',
  legalName: 'Cliente Uno S.A.C.',
  tradeName: 'Cliente Uno',
  ruc: null,
  industry: 'Tecnologia',
  size: 'micro',
  city: 'Lima',
  country: 'Peru',
  confidentiality: 'interno',
  createdAt: '2026-01-01T00:00:00.000Z',
  isIllustrative: true,
}

const otherClient: Client = { ...client, id: 'c2', tradeName: 'Cliente Dos', industry: 'Retail' }

describe('buildClientRows', () => {
  const opportunities: Opportunity[] = [
    {
      id: 'o1',
      clientId: 'c1',
      title: 'Oportunidad abierta',
      status: 'en_negociacion',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
      isIllustrative: true,
    },
    {
      id: 'o2',
      clientId: 'c1',
      title: 'Oportunidad cerrada',
      status: 'ganado',
      lossReason: null,
      expectedAmount: 1000,
      ownerId: 'u1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
      isIllustrative: true,
    },
  ]

  const projects: Project[] = [
    {
      id: 'p1',
      code: 'VK-0001',
      clientId: 'c1',
      opportunityId: null,
      name: 'Proyecto activo',
      status: 'activo',
      health: 'sano',
      healthReason: null,
      ownerId: 'u1',
      startDate: '2026-01-01T00:00:00.000Z',
      targetDate: '2026-06-01T00:00:00.000Z',
      archivedAt: null,
      isIllustrative: true,
    },
  ]

  const meetings: Meeting[] = [
    {
      id: 'm1',
      clientId: 'c1',
      projectId: null,
      type: 'levantamiento',
      title: 'Reunion',
      agenda: 'Agenda',
      startsAt: '2026-03-01T00:00:00.000Z',
      endsAt: '2026-03-01T01:00:00.000Z',
      organizerId: 'u1',
      isMock: true,
      meetUrl: null,
      providerEventId: null,
      requestId: 'req',
      syncStatus: 'pendiente',
      syncError: null,
      attendees: [],
      hasMinutes: false,
      notes: null,
      isIllustrative: true,
    },
  ]

  it('cuenta oportunidades abiertas y proyectos activos solo del cliente correspondiente', () => {
    const rows = buildClientRows({ clients: [client, otherClient], opportunities, projects, meetings })
    const row1 = rows.find((r) => r.client.id === 'c1')
    const row2 = rows.find((r) => r.client.id === 'c2')

    expect(row1?.openOpportunities).toBe(1)
    expect(row1?.activeProjects).toBe(1)
    expect(row2?.openOpportunities).toBe(0)
    expect(row2?.activeProjects).toBe(0)
  })

  it('la ultima interaccion es la fecha mas reciente entre reuniones y actualizaciones de oportunidad', () => {
    const rows = buildClientRows({ clients: [client], opportunities, projects, meetings })
    expect(rows[0]?.lastInteractionAt).toBe('2026-03-01T00:00:00.000Z')
  })

  it('devuelve null cuando el cliente no tiene actividad', () => {
    const rows = buildClientRows({ clients: [otherClient], opportunities, projects, meetings })
    expect(rows[0]?.lastInteractionAt).toBeNull()
  })
})

describe('uniqueIndustries', () => {
  it('devuelve industrias unicas ordenadas alfabeticamente', () => {
    expect(uniqueIndustries([client, otherClient, { ...client, id: 'c3', industry: 'Tecnologia' }])).toEqual([
      'Retail',
      'Tecnologia',
    ])
  })
})

describe('buildClientActivity', () => {
  it('ordena la actividad de mas reciente a mas antigua', () => {
    const activity = buildClientActivity({
      opportunities: [
        {
          id: 'o1',
          clientId: 'c1',
          title: 'Oportunidad',
          status: 'en_negociacion',
          lossReason: null,
          expectedAmount: 1,
          ownerId: 'u1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          isIllustrative: true,
        },
      ],
      projects: [],
      meetings: [
        {
          id: 'm1',
          clientId: 'c1',
          projectId: null,
          type: 'levantamiento',
          title: 'Reunion reciente',
          agenda: 'Agenda',
          startsAt: '2026-05-01T00:00:00.000Z',
          endsAt: '2026-05-01T01:00:00.000Z',
          organizerId: 'u1',
          isMock: true,
          meetUrl: null,
          providerEventId: null,
          requestId: 'req',
          syncStatus: 'pendiente',
          syncError: null,
          attendees: [],
          hasMinutes: false,
          notes: null,
          isIllustrative: true,
        },
      ],
    })

    expect(activity[0]?.id).toBe('meeting-m1')
    expect(activity[1]?.id).toBe('opportunity-o1')
  })
})
