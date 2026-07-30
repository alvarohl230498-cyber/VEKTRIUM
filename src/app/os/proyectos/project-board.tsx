'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import type { Client, ProjectWithPhases, User } from '@/data'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import { calculateProgress } from '@/domain/progress'
import { VEKTRIUM_PHASES } from '@/domain/phases'
import { formatLima } from '@/lib/dashboard'
import { PROJECT_HEALTH_ICON, PROJECT_HEALTH_LABELS, PROJECT_HEALTH_TEXT_CLASS, PROJECT_STATUS_LABELS } from '@/lib/labels'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { moveProjectPhaseAction } from './actions'

type ViewMode = 'tabla' | 'tablero'

function projectProgress(project: ProjectWithPhases): number {
  const tasks = project.phases.flatMap((phase) => phase.tasks)
  return Math.round(calculateProgress(tasks) * 100)
}

/** Fase (con id real) de `order` dentro de las fases concretas de un proyecto. */
function phaseAtOrder(project: ProjectWithPhases, order: number) {
  return project.phases.find((p) => p.order === order)
}

/** `order` de la fase que hoy es `currentPhaseId` de un proyecto. */
function currentOrderOf(project: ProjectWithPhases): number {
  return project.phases.find((p) => p.id === project.currentPhaseId)?.order ?? 0
}

function ProjectCard({
  project,
  clientName,
  draggable,
  isPending,
  onDragStart,
  onMove,
}: {
  project: ProjectWithPhases
  clientName: string
  draggable: boolean
  isPending: boolean
  onDragStart?: (e: React.DragEvent<HTMLLIElement>) => void
  onMove: (projectId: string, order: number) => void
}) {
  const currentOrder = currentOrderOf(project)

  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      aria-busy={isPending}
      className={`border border-vk-line bg-white p-3 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${isPending ? 'opacity-60' : ''}`}
    >
      <Link href={`/os/proyectos/${project.id}`} className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
        {project.code} · {project.name}
      </Link>
      <p className="mt-1 text-xs text-vk-muted">{clientName}</p>
      <p className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold ${PROJECT_HEALTH_TEXT_CLASS[project.health]}`}>
        <span aria-hidden="true">{PROJECT_HEALTH_ICON[project.health]}</span>
        {PROJECT_HEALTH_LABELS[project.health]}
      </p>
      <p className="mt-1 text-xs text-vk-muted">
        {projectProgress(project)}% · vence {formatLima(new Date(project.targetDate))}
      </p>
      {project.isIllustrative ? (
        <div className="mt-1">
          <IllustrativeBadge />
        </div>
      ) : null}

      <label htmlFor={`phase-select-${project.id}`} className="sr-only">
        Mover &quot;{project.name}&quot; a otra fase
      </label>
      <select
        id={`phase-select-${project.id}`}
        value={currentOrder}
        disabled={isPending}
        onChange={(e) => onMove(project.id, Number(e.target.value))}
        className="mt-2 w-full rounded-md border border-vk-line px-2 py-1 text-xs font-bold text-vk-ink disabled:opacity-60"
      >
        {VEKTRIUM_PHASES.map((phase) => (
          <option key={phase.order} value={phase.order}>
            {phase.name}
          </option>
        ))}
      </select>
    </li>
  )
}

export function ProjectBoard({
  initialProjects,
  clients,
  users,
}: {
  initialProjects: ProjectWithPhases[]
  clients: Client[]
  users: User[]
}) {
  const [view, setView] = useState<ViewMode>('tabla')
  const [projects, setProjects] = useState(initialProjects)
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const isDesktop = useIsDesktop()
  const clientById = new Map(clients.map((c) => [c.id, c]))
  const userById = new Map(users.map((u) => [u.id, u]))

  function handleMove(projectId: string, order: number) {
    const project = projects.find((p) => p.id === projectId)
    const targetPhase = project ? phaseAtOrder(project, order) : undefined
    if (!project || !targetPhase || project.currentPhaseId === targetPhase.id) return

    const previousProjects = projects
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, currentPhaseId: targetPhase.id } : p)))
    setPendingProjectId(projectId)
    setError(null)

    startTransition(async () => {
      const result = await moveProjectPhaseAction(projectId, targetPhase.id)
      setPendingProjectId(null)
      if (!result.ok) {
        setProjects(previousProjects)
        setError(result.message)
      }
    })
  }

  const activeProjects = projects.filter((p) => p.status === 'activo')

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Vista de proyectos" className="inline-flex rounded-md border border-vk-line bg-white p-1">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'tabla'}
          onClick={() => setView('tabla')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'tabla' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Tabla
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'tablero'}
          onClick={() => setView('tablero')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'tablero' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Tablero
        </button>
      </div>

      {view === 'tabla' ? (
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
                const progress = projectProgress(project)
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
      ) : (
        <div className="space-y-4">
          {error ? (
            <p role="alert" className="rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
              {error}
            </p>
          ) : null}

          {activeProjects.length === 0 ? (
            <div className="border border-vk-line bg-white p-8 text-center text-sm text-vk-muted">
              No hay proyectos activos para mostrar en el tablero.
            </div>
          ) : isDesktop ? (
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-3 pb-2">
                {VEKTRIUM_PHASES.map((phase) => {
                  const columnProjects = activeProjects.filter((p) => currentOrderOf(p) === phase.order)
                  return (
                    <div
                      key={phase.order}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const projectId = e.dataTransfer.getData('text/plain')
                        handleMove(projectId, phase.order)
                      }}
                      className="w-64 shrink-0 border border-vk-line bg-vk-ice/60 p-3"
                    >
                      <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                        {phase.name} <span className="text-vk-muted">({columnProjects.length})</span>
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {columnProjects.map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            clientName={clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}
                            draggable
                            isPending={pendingProjectId === project.id}
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', project.id)}
                            onMove={handleMove}
                          />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {VEKTRIUM_PHASES.map((phase) => {
                const columnProjects = activeProjects.filter((p) => currentOrderOf(p) === phase.order)
                if (columnProjects.length === 0) return null
                return (
                  <section key={phase.order} aria-label={phase.name}>
                    <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                      {phase.name} <span className="text-vk-muted">({columnProjects.length})</span>
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {columnProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          clientName={clientById.get(project.clientId)?.tradeName ?? 'Cliente desconocido'}
                          draggable={false}
                          isPending={pendingProjectId === project.id}
                          onMove={handleMove}
                        />
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
