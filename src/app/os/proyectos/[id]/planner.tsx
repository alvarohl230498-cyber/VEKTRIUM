'use client'

import { useId, useState, useTransition } from 'react'
import type { ProjectPhaseWithTasks, Task, User } from '@/data'
import { calculateProgress } from '@/domain/progress'
import type { TaskStatus } from '@/domain/progress'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import { formatLima } from '@/lib/dashboard'
import { TASK_KANBAN_ORDER, TASK_STATUS_LABELS } from '@/lib/labels'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { moveTaskAction } from '../actions'

function applyStatus(phases: ProjectPhaseWithTasks[], taskId: string, status: TaskStatus): ProjectPhaseWithTasks[] {
  return phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((t) =>
      t.id === taskId
        ? { ...t, status, completedAt: status === 'completada' ? new Date().toISOString() : t.completedAt }
        : t,
    ),
  }))
}

function replaceTask(phases: ProjectPhaseWithTasks[], task: Task): ProjectPhaseWithTasks[] {
  return phases.map((phase) => ({
    ...phase,
    tasks: phase.tasks.map((t) => (t.id === task.id ? task : t)),
  }))
}

function TaskCard({
  task,
  phaseName,
  assignee,
  draggable,
  isPending,
  onDragStart,
  onStatusChange,
}: {
  task: Task
  phaseName: string
  assignee: User | undefined
  draggable: boolean
  isPending: boolean
  onDragStart?: (e: React.DragEvent<HTMLLIElement>) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}) {
  const selectId = useId()
  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      aria-busy={isPending}
      className={`border border-vk-line bg-white p-3 ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${isPending ? 'opacity-60' : ''}`}
    >
      <p className="text-sm font-bold text-vk-ink">{task.title}</p>
      <p className="mt-1 text-xs text-vk-muted">
        {phaseName} · peso {task.weight}
        {task.dueDate ? ` · vence ${formatLima(new Date(task.dueDate))}` : ''}
      </p>
      <p className="text-xs text-vk-muted">{assignee?.fullName ?? 'Sin asignar'}</p>
      {task.isIllustrative ? (
        <div className="mt-1">
          <IllustrativeBadge />
        </div>
      ) : null}

      <label htmlFor={selectId} className="sr-only">
        Mover &quot;{task.title}&quot; a otro estado
      </label>
      <select
        id={selectId}
        value={task.status}
        disabled={isPending}
        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
        className="mt-2 w-full rounded-md border border-vk-line px-2 py-1 text-xs font-bold text-vk-ink disabled:opacity-60"
      >
        {TASK_KANBAN_ORDER.map((status) => (
          <option key={status} value={status}>
            {TASK_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </li>
  )
}

export function Planner({ initialPhases, users }: { initialPhases: ProjectPhaseWithTasks[]; users: User[] }) {
  const [phases, setPhases] = useState(initialPhases)
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const isDesktop = useIsDesktop()

  const phaseNameByTaskId = new Map<string, string>()
  for (const phase of phases) {
    for (const task of phase.tasks) phaseNameByTaskId.set(task.id, phase.name)
  }
  const userById = new Map(users.map((u) => [u.id, u]))
  const allTasks = phases.flatMap((p) => p.tasks)
  const progress = Math.round(calculateProgress(allTasks) * 100)

  function handleMove(taskId: string, status: TaskStatus) {
    const current = allTasks.find((t) => t.id === taskId)
    if (!current || current.status === status) return

    const previousPhases = phases
    setPhases((prev) => applyStatus(prev, taskId, status))
    setPendingTaskId(taskId)
    setError(null)

    startTransition(async () => {
      const result = await moveTaskAction(taskId, status)
      setPendingTaskId(null)
      if (!result.ok) {
        setPhases(previousPhases)
        setError(result.message)
      } else {
        setPhases((prev) => replaceTask(prev, result.task))
      }
    })
  }

  const columns = TASK_KANBAN_ORDER.map((status) => ({
    status,
    tasks: allTasks.filter((t) => t.status === status),
  }))

  return (
    <div className="space-y-4">
      <div className="border border-vk-line bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-vk-navy">Avance ponderado</p>
          <span className="font-display text-xl font-extrabold text-vk-cobalt">{progress}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-vk-ice"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance ponderado del proyecto"
        >
          <div className="h-full bg-vk-cobalt transition-[width]" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-vk-muted">Se recalcula automáticamente cuando una tarea cambia de estado.</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {error}
        </p>
      ) : null}

      {allTasks.length === 0 ? (
        <div className="border border-vk-line bg-white p-8 text-center text-sm text-vk-muted">
          Este proyecto todavía no tiene tareas.
        </div>
      ) : isDesktop ? (
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3 pb-2">
            {columns.map((column) => (
              <div
                key={column.status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData('text/plain')
                  handleMove(taskId, column.status)
                }}
                className="w-64 shrink-0 border border-vk-line bg-vk-ice/60 p-3"
              >
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                  {TASK_STATUS_LABELS[column.status]} <span className="text-vk-muted">({column.tasks.length})</span>
                </h3>
                <ul className="mt-2 space-y-2">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      phaseName={phaseNameByTaskId.get(task.id) ?? ''}
                      assignee={task.assigneeId ? userById.get(task.assigneeId) : undefined}
                      draggable
                      isPending={pendingTaskId === task.id}
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                      onStatusChange={handleMove}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {columns
            .filter((column) => column.tasks.length > 0)
            .map((column) => (
              <section key={column.status} aria-label={TASK_STATUS_LABELS[column.status]}>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                  {TASK_STATUS_LABELS[column.status]} <span className="text-vk-muted">({column.tasks.length})</span>
                </h3>
                <ul className="mt-2 space-y-2">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      phaseName={phaseNameByTaskId.get(task.id) ?? ''}
                      assignee={task.assigneeId ? userById.get(task.assigneeId) : undefined}
                      draggable={false}
                      isPending={pendingTaskId === task.id}
                      onStatusChange={handleMove}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}
