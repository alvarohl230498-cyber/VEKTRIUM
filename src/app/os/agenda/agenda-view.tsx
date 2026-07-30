'use client'

import { useMemo, useState } from 'react'
import type { Client, Meeting, Project, User } from '@/data'
import { buildMonthGrid, groupMeetingsByDay, limaDateKey } from '@/lib/agenda'
import { MeetingCard } from './meeting-card'
import { MonthGrid } from './month-grid'

type ViewMode = 'lista' | 'mes'

export function AgendaView({
  meetings,
  clients,
  projects,
  users,
  nowIso,
}: {
  meetings: Meeting[]
  clients: Client[]
  projects: Project[]
  users: User[]
  nowIso: string
}) {
  const now = useMemo(() => new Date(nowIso), [nowIso])
  const [view, setView] = useState<ViewMode>('lista')
  const [monthCursor, setMonthCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const clientById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients])
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const visibleMeetings = selectedDay
    ? meetings.filter((m) => limaDateKey(new Date(m.startsAt)) === selectedDay)
    : meetings

  const groups = useMemo(() => groupMeetingsByDay(visibleMeetings, now), [visibleMeetings, now])
  const grid = useMemo(() => buildMonthGrid(monthCursor, meetings, now), [monthCursor, meetings, now])

  if (meetings.length === 0) {
    return (
      <div className="border border-vk-line bg-white p-8 text-center">
        <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay reuniones</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
          Usa el formulario &quot;Nueva reunión&quot; de arriba para agendar la primera. Puedes crear un enlace de
          Meet simulado al guardarla.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Vista de agenda" className="inline-flex rounded-md border border-vk-line bg-white p-1">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'lista'}
            onClick={() => setView('lista')}
            className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${
              view === 'lista' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'
            }`}
          >
            Lista
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'mes'}
            onClick={() => setView('mes')}
            className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${
              view === 'mes' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'
            }`}
          >
            Mes
          </button>
        </div>

        {selectedDay ? (
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy"
          >
            Quitar filtro de día ({selectedDay})
          </button>
        ) : null}
      </div>

      {view === 'mes' ? (
        <MonthGrid
          grid={grid}
          monthCursor={monthCursor}
          selectedDay={selectedDay}
          onPrevMonth={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          onNextMonth={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          onSelectDay={setSelectedDay}
        />
      ) : null}

      {groups.length === 0 ? (
        <div className="border border-vk-line bg-white p-6 text-center text-sm text-vk-muted">
          No hay reuniones para el día seleccionado.{' '}
          <button type="button" onClick={() => setSelectedDay(null)} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
            Ver toda la agenda
          </button>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.dateKey} aria-labelledby={`day-${group.dateKey}`}>
            <h3 id={`day-${group.dateKey}`} className="font-display text-base font-extrabold text-vk-navy">
              {group.heading}
            </h3>
            <ul className="mt-2 space-y-3">
              {group.meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  client={clientById.get(meeting.clientId)}
                  project={meeting.projectId ? projectById.get(meeting.projectId) : undefined}
                  organizer={userById.get(meeting.organizerId)}
                  isPast={group.isPast}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
