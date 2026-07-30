import type { Metadata } from 'next'
import Link from 'next/link'
import { getRepository } from '@/data'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import { calculateProgress } from '@/domain/progress'
import { formatLima } from '@/lib/dashboard'
import { PROJECT_HEALTH_ICON, PROJECT_HEALTH_LABELS, PROJECT_HEALTH_TEXT_CLASS, PROJECT_STATUS_LABELS } from '@/lib/labels'
import { requireSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Proyectos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProyectosPage() {
  await requireSession()

  const repository = getRepository()
  const [projects, clients, users] = await Promise.all([
    repository.listProjectsWithPhases(),
    repository.listClients(),
    repository.listUsers(),
  ])

  const clientById = new Map(clients.map((c) => [c.id, c]))
  const userById = new Map(users.map((u) => [u.id, u]))

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Proyectos</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">Cartera de proyectos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          El avance de cada proyecto es ponderado: se calcula siempre a partir de las tareas, nunca se edita a
          mano. La salud combina color, texto e ícono para no depender solo del color.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border border-vk-line bg-white p-8 text-center">
          <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay proyectos</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
            Los proyectos nacen al convertir una oportunidad. Ve a{' '}
            <Link href="/os/oportunidades" className="font-extrabold text-vk-cobalt hover:text-vk-navy">
              Oportunidades
            </Link>{' '}
            y usa &quot;Convertir en proyecto&quot; sobre una oportunidad ganada.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-vk-line bg-white">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-vk-line text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">
                <th scope="col" className="px-4 py-3">Proyecto</th>
                <th scope="col" className="px-4 py-3">Cliente</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Salud</th>
                <th scope="col" className="px-4 py-3">Avance</th>
                <th scope="col" className="px-4 py-3">Responsable</th>
                <th scope="col" className="px-4 py-3">Fecha objetivo</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const tasks = project.phases.flatMap((phase) => phase.tasks)
                const progress = Math.round(calculateProgress(tasks) * 100)
                return (
                  <tr key={project.id} className="border-b border-vk-line last:border-b-0 hover:bg-vk-ice">
                    <td className="px-4 py-3">
                      <Link href={`/os/proyectos/${project.id}`} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                        {project.code} · {project.name}
                      </Link>
                      {project.isIllustrative ? (
                        <div className="mt-1">
                          <IllustrativeBadge />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-vk-ink">{clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}</td>
                    <td className="px-4 py-3 text-vk-ink">{PROJECT_STATUS_LABELS[project.status]}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 font-bold ${PROJECT_HEALTH_TEXT_CLASS[project.health]}`}>
                        <span aria-hidden="true">{PROJECT_HEALTH_ICON[project.health]}</span>
                        {PROJECT_HEALTH_LABELS[project.health]}
                      </span>
                      {project.healthReason ? <p className="mt-1 max-w-[220px] text-xs text-vk-muted">{project.healthReason}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-vk-ice" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full bg-vk-cobalt" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-vk-ink">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-vk-ink">{userById.get(project.ownerId)?.fullName ?? 'Sin asignar'}</td>
                    <td className="px-4 py-3 text-vk-ink">{formatLima(new Date(project.targetDate))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
