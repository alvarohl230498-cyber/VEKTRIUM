'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import type { Client, User } from '@/data'
import { initialNewOpportunityState } from './action-state'
import { createOpportunityAction } from './actions'

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
      {message}
    </p>
  )
}

export function NewOpportunityForm({ clients, users }: { clients: Client[]; users: User[] }) {
  const [state, formAction, pending] = useActionState(createOpportunityAction, initialNewOpportunityState)
  const formRef = useRef<HTMLFormElement>(null)
  const formId = useId()

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state.status])

  return (
    <details className="border border-vk-line bg-white p-6">
      <summary className="cursor-pointer font-display text-xl font-extrabold text-vk-navy">
        Nueva oportunidad
      </summary>

      {state.status === 'success' ? (
        <p role="status" className="mt-4 rounded-md border border-vk-success/30 bg-vk-success/10 px-4 py-3 text-sm font-semibold text-vk-success">
          Oportunidad creada como &quot;Nuevo lead&quot;.
        </p>
      ) : null}
      {state.formError ? (
        <p role="alert" className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-clientId`} className="text-sm font-bold text-vk-navy">
            Cliente <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-clientId`}
            name="clientId"
            required
            defaultValue={clients[0]?.id ?? ''}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradeName ?? c.legalName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.clientId} />
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

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-title`} className="text-sm font-bold text-vk-navy">
            Título <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            required
            maxLength={140}
            placeholder="Ej. Automatización de reportes de ventas"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.title} />
        </div>

        <div>
          <label htmlFor={`${formId}-expectedAmount`} className="text-sm font-bold text-vk-navy">
            Monto esperado (S/) <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-expectedAmount`}
            name="expectedAmount"
            type="number"
            min={0}
            step="0.01"
            required
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.expectedAmount} />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-vk-cobalt px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar oportunidad'}
          </button>
        </div>
      </form>
    </details>
  )
}
