import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRepository } from '@/data'
import { IllustrativeBadge, SimulatedBadge } from '@/components/os/illustrative-badge'
import { calculateProgress } from '@/domain/progress'
import { MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { formatLima } from '@/lib/dashboard'
import {
  PROJECT_HEALTH_ICON,
  PROJECT_HEALTH_LABELS,
  PROJECT_HEALTH_TEXT_CLASS,
  PROJECT_STATUS_LABELS,
  TASK_STATUS_LABELS,
} from '@/lib/labels'
import { computeNextMeeting, computeNextMilestone, computePhaseProgress, computePriorityTasks } from '@/lib/projects'
import { getSession, requireSession } from '@/lib/session'
import { Planner } from './planner'

type Params = Promise<{ id: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const session = await getSession()
  if (!session) return { title: 'Proyecto', robots: { index: false, follow: false } }

  const repository = getRepository(session.user.id)
  const project = await repository.getProjectWithPhases(id)
  return {
    title: project ? `${project.code} · ${project.name}` : 'Proyecto',
    robots: { index: false, follow: false },
  }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const session = await requireSession()
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = tab === 'planner' ? 'planner' : 'resumen'

  const repository = getRepository(session.user.id)
  const project = await repository.getProjectWithPhases(id)
  if (!project) notFound()

  const [client, owner, meetings, users] = await Promise.all([
    repository.getClientById(project.clientId),
    repository.getUserById(project.ownerId),
    repository.listMeetings(),
    repository.listUsers(),
  ])

  const now = new Date()
  const allTasks = project.phases.flatMap((phase) => phase.tasks)
  const progress = Math.round(calculateProgress(allTasks) * 100)
  const nextMilestone = computeNextMilestone(project.phases)
  const nextMeeting = computeNextMeeting(meetings, project.id, now)
  const phaseProgress = computePhaseProgress(project.phases)
  const priorityTasks = computePriorityTasks(allTasks, now)
  const userById = new Map(users.map((u) => [u.id, u]))

  return (
    <div className="space-y-6">
      <div>
        <Link href="/os/proyectos" className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
          ← Volver a proyectos
        </Link>
      </div>

      <div className="border border-vk-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
              {project.code} · {PROJECT_STATUS_LABELS[project.status]}
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-vk-navy">{project.name}</h1>
            {client ? (
              <p className="mt-1 text-sm text-vk-muted">
                Cliente:{' '}
                <Link href={`/os/clientes/${client.id}`} className="font-bold text-vk-cobalt hover:text-vk-navy">
                  {client.tradeName ?? client.legalName}
                </Link>
              </p>
            ) : null}
          </div>
          {project.isIllustrative ? <IllustrativeBadge /> : null}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Salud</dt>
            <dd className={`mt-1 inline-flex items-center gap-1.5 text-sm font-bold ${PROJECT_HEALTH_TEXT_CLASS[project.health]}`}>
              <span aria-hidden="true">{PROJECT_HEALTH_ICON[project.health]}</span>
              {PROJECT_HEALTH_LABELS[project.health]}
            </dd>
            {project.healthReason ? <dd className="mt-1 text-xs text-vk-muted">{project.healthReason}</dd> : null}
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Avance ponderado</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{progress}%</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Responsable</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{owner?.fullName ?? 'Sin asignar'}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Fecha objetivo</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{formatLima(new Date(project.targetDate))}</dd>
          </div>
        </dl>
      </div>

      <div role="tablist" aria-label="Secciones del proyecto" className="inline-flex rounded-md border border-vk-line bg-white p-1">
        <Link
          href={`/os/proyectos/${project.id}`}
          role="tab"
          aria-selected={activeTab === 'resumen'}
          aria-current={activeTab === 'resumen' ? 'page' : undefined}
          className={`rounded-md px-4 py-1.5 text-sm font-extrabold transition ${activeTab === 'resumen' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Resumen
        </Link>
        <Link
          href={`/os/proyectos/${project.id}?tab=planner`}
          role="tab"
          aria-selected={activeTab === 'planner'}
          aria-current={activeTab === 'planner' ? 'page' : undefined}
          className={`rounded-md px-4 py-1.5 text-sm font-extrabold transition ${activeTab === 'planner' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Planner
        </Link>
      </div>

      {activeTab === 'resumen' ? (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <section aria-labelledby="objetivo-heading" className="border border-vk-line bg-white p-6">
              <h2 id="objetivo-heading" className="font-display text-lg font-extrabold text-vk-navy">
                Objetivo
              </h2>
              <p className="mt-2 text-sm leading-6 text-vk-muted">
                Entregar &quot;{project.name}&quot; para {client?.tradeName ?? 'el cliente'} antes del{' '}
                {formatLima(new Date(project.targetDate))}, siguiendo las 9 fases de la metodología VEKTRIUM.
              </p>
            </section>

            <section aria-labelledby="milestone-heading" className="border border-vk-line bg-white p-6">
              <h2 id="milestone-heading" className="font-display text-lg font-extrabold text-vk-navy">
                Próximo hito
              </h2>
              {nextMilestone ? (
                <>
                  <p className="mt-2 text-sm font-bold text-vk-ink">
                    Fase {nextMilestone.order}: {nextMilestone.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-vk-muted">{nextMilestone.description}</p>
                  {nextMilestone.plannedEnd ? (
                    <p className="mt-1 text-xs text-vk-muted">Fin planeado: {formatLima(new Date(nextMilestone.plannedEnd))}</p>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-vk-muted">Todas las fases están completas.</p>
              )}
            </section>

            <section aria-labelledby="reunion-heading" className="border border-vk-line bg-white p-6">
              <h2 id="reunion-heading" className="font-display text-lg font-extrabold text-vk-navy">
                Próxima reunión
              </h2>
              {nextMeeting ? (
                <>
                  <p className="mt-2 text-sm font-bold text-vk-ink">{nextMeeting.title}</p>
                  <p className="mt-1 text-sm text-vk-muted">
                    {formatLima(new Date(nextMeeting.startsAt))} · {formatLimaTime(new Date(nextMeeting.startsAt))} ·{' '}
                    {MEETING_TYPE_LABELS[nextMeeting.type]}
                  </p>
                  {nextMeeting.isMock ? (
                    <div className="mt-2">
                      <SimulatedBadge />
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-vk-muted">
                  Sin reuniones agendadas para este proyecto.{' '}
                  <Link href="/os/agenda" className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                    Agenda una
                  </Link>
                  .
                </p>
              )}
            </section>

            <section aria-labelledby="fases-heading" className="border border-vk-line bg-white p-6">
              <h2 id="fases-heading" className="font-display text-lg font-extrabold text-vk-navy">
                Avance por fase
              </h2>
              <ul className="mt-3 space-y-2">
                {phaseProgress.map((phase) => (
                  <li key={phase.phaseId}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-vk-ink">
                        {phase.order}. {phase.name}
                      </span>
                      <span className="font-bold text-vk-muted">{phase.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-vk-ice">
                      <div className="h-full bg-vk-cobalt" style={{ width: `${phase.progress}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="prioridad-heading" className="border border-vk-line bg-white p-6">
            <h2 id="prioridad-heading" className="font-display text-lg font-extrabold text-vk-navy">
              Tareas prioritarias
            </h2>
            <p className="mt-1 text-sm text-vk-muted">Bloqueadas, en revisión, esperando al cliente, o vencidas.</p>
            {priorityTasks.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-vk-muted">No hay tareas que requieran atención inmediata.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {priorityTasks.map((task) => (
                  <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-vk-line pb-2 last:border-b-0">
                    <div>
                      <p className="text-sm font-bold text-vk-ink">{task.title}</p>
                      <p className="text-xs text-vk-muted">
                        {TASK_STATUS_LABELS[task.status]} · {userById.get(task.assigneeId ?? '')?.fullName ?? 'Sin asignar'}
                        {task.dueDate ? ` · vence ${formatLima(new Date(task.dueDate))}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <Planner initialPhases={project.phases} users={users} />
      )}
    </div>
  )
}
