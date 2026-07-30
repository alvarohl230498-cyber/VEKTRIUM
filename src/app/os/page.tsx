import type { Metadata } from 'next'
import type { Task } from '@/data'
import { getRepository } from '@/data'
import { IllustrativeBadge, SimulatedBadge } from '@/components/os/illustrative-badge'
import { MEETING_TYPE_LABELS } from '@/lib/agenda'
import {
  formatLima,
  formatLimaDateTime,
  getAttentionItems,
  getUpcomingMeetings,
  summarizePortfolio,
  type AttentionKind,
} from '@/lib/dashboard'

export const metadata: Metadata = {
  title: 'Inicio',
  robots: {
    index: false,
    follow: false,
  },
}

const ATTENTION_KIND_LABEL: Record<AttentionKind, string> = {
  tarea_vencida: 'Tarea vencida',
  reunion_sin_minuta: 'Reunion sin minuta',
  propuesta_sin_seguimiento: 'Propuesta sin seguimiento',
}

export default async function OsDashboard() {
  const repository = getRepository()
  const [users, clients, opportunities, projects, projectsWithPhases, meetings] = await Promise.all([
    repository.listUsers(),
    repository.listClients(),
    repository.listOpportunities(),
    repository.listProjects(),
    repository.listProjectsWithPhases(),
    repository.listMeetings(),
  ])

  const tasks: Task[] = projectsWithPhases.flatMap((project) =>
    project.phases.flatMap((phase) => phase.tasks),
  )

  const now = new Date()
  const portfolio = summarizePortfolio({ projects, opportunities, tasks, now })
  const attention = getAttentionItems({ tasks, meetings, opportunities, users, clients, now })
  const upcomingMeetings = getUpcomingMeetings({ meetings, clients, now })

  const metrics = [
    { value: portfolio.activeProjects, label: 'Proyectos activos' },
    { value: portfolio.atRiskProjects, label: 'Proyectos en riesgo' },
    { value: portfolio.openOpportunities, label: 'Oportunidades abiertas' },
    { value: portfolio.dueThisWeek, label: 'Entregas esta semana' },
  ]

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
            Panel de fundadores
          </p>
          <IllustrativeBadge />
        </div>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-vk-navy">
          Menos friccion. Mas control.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-vk-muted">
          Vista privada de VEKTRIUM OS. Todas las cifras de esta pantalla provienen de datos de
          desarrollo ficticios; ningun cliente ni proyecto real esta representado aqui.
        </p>
      </div>

      <section aria-labelledby="cartera-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="cartera-heading" className="font-display text-2xl font-extrabold text-vk-navy">
            Resumen de cartera
          </h2>
          <IllustrativeBadge />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="border border-vk-line bg-white p-5">
              <p className="font-display text-3xl font-extrabold text-vk-cobalt">
                {String(metric.value).padStart(2, '0')}
              </p>
              <p className="mt-2 text-sm font-bold text-vk-navy">{metric.label}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="atencion-heading" className="border border-vk-line bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="atencion-heading" className="font-display text-2xl font-extrabold text-vk-navy">
              Necesita atencion
            </h2>
            <IllustrativeBadge />
          </div>

          {attention.length === 0 ? (
            <p className="mt-6 text-sm leading-6 text-vk-muted">
              No hay tareas vencidas, reuniones sin minuta ni propuestas sin seguimiento en este
              momento.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {attention.map((item) => (
                <li key={item.id} className="border-b border-vk-line pb-4 last:border-b-0">
                  <span className="inline-flex rounded-md bg-vk-ice px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                    {ATTENTION_KIND_LABEL[item.kind]}
                  </span>
                  <p className="mt-2 text-sm font-bold text-vk-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-vk-muted">{item.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="reuniones-heading" className="border border-vk-line bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id="reuniones-heading" className="font-display text-2xl font-extrabold text-vk-navy">
              Proximas reuniones
            </h2>
            <IllustrativeBadge />
          </div>

          {upcomingMeetings.length === 0 ? (
            <p className="mt-6 text-sm leading-6 text-vk-muted">
              No hay reuniones agendadas.{' '}
              <a href="/os/agenda" className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                Agenda la primera desde el modulo Agenda.
              </a>
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {upcomingMeetings.map((meeting) => (
                <li key={meeting.id} className="border-b border-vk-line pb-4 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-vk-ink">{meeting.title}</p>
                    {meeting.isMock ? <SimulatedBadge /> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-vk-muted">
                    {formatLimaDateTime(new Date(meeting.startsAt))} · {meeting.clientName} ·{' '}
                    {MEETING_TYPE_LABELS[meeting.type] ?? meeting.type}
                  </p>
                  {meeting.meetUrl ? (
                    <a
                      href={meeting.meetUrl}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-extrabold text-vk-cobalt transition hover:text-vk-navy"
                    >
                      Unirse a Meet {meeting.isMock ? <SimulatedBadge /> : null}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-xs text-vk-muted">
        Ultima actualizacion: {formatLima(now)} (hora de Lima).
      </p>
    </div>
  )
}
