'use client'

import { useActionState, useEffect, useId } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/data'
import { initialConvertState } from '../action-state'
import { convertOpportunityAction } from '../actions'

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
      {message}
    </p>
  )
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function plusDaysIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function ConvertForm({
  opportunityId,
  defaultName,
  users,
}: {
  opportunityId: string
  defaultName: string
  users: User[]
}) {
  const [state, formAction, pending] = useActionState(convertOpportunityAction, initialConvertState)
  const formId = useId()
  const router = useRouter()

  useEffect(() => {
    if (state.status === 'success' && state.projectId) {
      router.push(`/os/proyectos/${state.projectId}`)
    }
  }, [state.status, state.projectId, router])

  return (
    <div className="border border-vk-line bg-white p-6">
      <h2 className="font-display text-xl font-extrabold text-vk-navy">Convertir en proyecto</h2>
      <p className="mt-1 text-sm leading-6 text-vk-muted">
        Crea el proyecto, le aplica las 9 fases de la plantilla VEKTRIUM y marca esta oportunidad como
        &quot;Ganado&quot; — sin eliminarla.
      </p>

      {state.formError ? (
        <p role="alert" className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}

      <form action={formAction} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="opportunityId" value={opportunityId} />

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-name`} className="text-sm font-bold text-vk-navy">
            Nombre del proyecto <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.name} />
        </div>

        <div>
          <label htmlFor={`${formId}-ownerId`} className="text-sm font-bold text-vk-navy">
            Responsable <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-ownerId`}
            name="ownerId"
            required
            defaultValue={users[0]?.id ?? ''}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.ownerId} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${formId}-startDate`} className="text-sm font-bold text-vk-navy">
              Inicio <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-startDate`}
              name="startDate"
              type="date"
              required
              defaultValue={todayIso()}
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.startDate} />
          </div>
          <div>
            <label htmlFor={`${formId}-targetDate`} className="text-sm font-bold text-vk-navy">
              Objetivo <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-targetDate`}
              name="targetDate"
              type="date"
              required
              defaultValue={plusDaysIso(60)}
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.targetDate} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-vk-lime px-5 py-2.5 text-sm font-extrabold text-vk-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Convirtiendo…' : 'Convertir en proyecto'}
          </button>
        </div>
      </form>
    </div>
  )
}
