import { describe, expect, it } from 'vitest'
import type { Meeting } from '@/data'
import {
  buildLimaIso,
  buildMonthGrid,
  findSchedulingConflicts,
  groupMeetingsByDay,
  limaDateKey,
} from '@/lib/agenda'

function meeting(overrides: Partial<Meeting> & Pick<Meeting, 'id' | 'startsAt' | 'endsAt'>): Meeting {
  return {
    clientId: 'c1',
    projectId: null,
    type: 'levantamiento',
    title: 'Reunion',
    agenda: 'Agenda de prueba con suficiente longitud.',
    organizerId: 'user-alvaro',
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
    ...overrides,
  }
}

describe('buildLimaIso', () => {
  it('interpreta fecha y hora como America/Lima (UTC-5) sin importar la zona del servidor', () => {
    const iso = buildLimaIso('2026-08-03', '10:00')
    // 10:00 Lima == 15:00 UTC
    expect(iso).toBe('2026-08-03T15:00:00.000Z')
  })
})

describe('limaDateKey', () => {
  it('agrupa un instante que cruza medianoche UTC bajo el dia correcto en Lima', () => {
    // 2026-08-04T02:00:00Z == 2026-08-03T21:00:00 en Lima (UTC-5)
    expect(limaDateKey(new Date('2026-08-04T02:00:00.000Z'))).toBe('2026-08-03')
  })
})

describe('findSchedulingConflicts', () => {
  const existing = meeting({
    id: 'm1',
    organizerId: 'user-alvaro',
    startsAt: '2026-08-03T15:00:00.000Z',
    endsAt: '2026-08-03T16:00:00.000Z',
  })

  it('detecta superposicion parcial con el mismo organizador', () => {
    const conflicts = findSchedulingConflicts({
      meetings: [existing],
      organizerId: 'user-alvaro',
      startsAt: '2026-08-03T15:30:00.000Z',
      endsAt: '2026-08-03T16:30:00.000Z',
    })
    expect(conflicts.map((m) => m.id)).toEqual(['m1'])
  })

  it('no marca conflicto si los horarios son contiguos sin superposicion', () => {
    const conflicts = findSchedulingConflicts({
      meetings: [existing],
      organizerId: 'user-alvaro',
      startsAt: '2026-08-03T16:00:00.000Z',
      endsAt: '2026-08-03T17:00:00.000Z',
    })
    expect(conflicts).toHaveLength(0)
  })

  it('ignora reuniones de otro organizador', () => {
    const conflicts = findSchedulingConflicts({
      meetings: [existing],
      organizerId: 'user-juan-diego',
      startsAt: '2026-08-03T15:00:00.000Z',
      endsAt: '2026-08-03T16:00:00.000Z',
    })
    expect(conflicts).toHaveLength(0)
  })

  it('excluye la propia reunion al editar (excludeMeetingId)', () => {
    const conflicts = findSchedulingConflicts({
      meetings: [existing],
      organizerId: 'user-alvaro',
      startsAt: '2026-08-03T15:00:00.000Z',
      endsAt: '2026-08-03T16:00:00.000Z',
      excludeMeetingId: 'm1',
    })
    expect(conflicts).toHaveLength(0)
  })
})

describe('groupMeetingsByDay', () => {
  it('agrupa y ordena reuniones por dia, marcando los dias pasados', () => {
    const now = new Date('2026-08-03T12:00:00.000Z')
    const meetings = [
      meeting({ id: 'futuro', startsAt: '2026-08-05T15:00:00.000Z', endsAt: '2026-08-05T16:00:00.000Z' }),
      meeting({ id: 'pasado', startsAt: '2026-08-01T15:00:00.000Z', endsAt: '2026-08-01T16:00:00.000Z' }),
    ]

    const groups = groupMeetingsByDay(meetings, now)
    expect(groups.map((g) => g.dateKey)).toEqual(['2026-08-01', '2026-08-05'])
    expect(groups[0]?.isPast).toBe(true)
    expect(groups[1]?.isPast).toBe(false)
  })
})

describe('buildMonthGrid', () => {
  it('cubre semanas completas y ubica las reuniones en su celda', () => {
    const now = new Date('2026-08-03T12:00:00.000Z')
    const meetings = [
      meeting({ id: 'm1', startsAt: '2026-08-15T15:00:00.000Z', endsAt: '2026-08-15T16:00:00.000Z' }),
    ]

    const grid = buildMonthGrid(new Date(2026, 7, 1), meetings, now)
    expect(grid.length).toBeGreaterThan(0)
    expect(grid[0]).toHaveLength(7)

    const cellsWithMeeting = grid.flat().filter((cell) => cell.meetings.length > 0)
    expect(cellsWithMeeting).toHaveLength(1)
    expect(cellsWithMeeting[0]?.inCurrentMonth).toBe(true)
  })
})
