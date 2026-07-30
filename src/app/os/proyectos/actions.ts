'use server'

import { revalidatePath } from 'next/cache'
import type { Task } from '@/data'
import { getRepository } from '@/data'
import { can } from '@/domain/permissions'
import type { TaskStatus } from '@/domain/progress'
import { requireSession } from '@/lib/session'

export type MoveTaskResult = { ok: true; task: Task } | { ok: false; message: string }

/**
 * Llamado directamente desde el Planner (arrastre o selector movil), no
 * desde un <form>. `moveTask()` del repositorio ya aplica
 * transitionTask() del dominio; si la transicion es invalida devuelve null
 * y aqui se traduce a un mensaje en espanol para que el Planner revierta la
 * tarjeta mostrando por que.
 */
export async function moveTaskAction(taskId: string, status: TaskStatus): Promise<MoveTaskResult> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'task.update' }) === 'none') {
    return { ok: false, message: 'No tienes permiso para mover esta tarea.' }
  }

  const repository = getRepository(session.user.id)
  const task = await repository.moveTask(taskId, status)
  if (!task) {
    return {
      ok: false,
      message: 'No se pudo mover la tarea: no existe, o esa transición no está permitida desde su estado actual.',
    }
  }

  revalidatePath(`/os/proyectos/${task.projectId}`)
  revalidatePath('/os/proyectos')

  return { ok: true, task }
}
