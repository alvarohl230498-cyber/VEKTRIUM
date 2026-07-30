'use client'

import { useActionState, useId, useState } from 'react'
import { OPPORTUNITY_KANBAN_ORDER, OPPORTUNITY_STATUS_LABELS } from '@/lib/labels'
import { initialTransitionState } from './action-state'
import { transitionOpportunityAction } from './actions'

export function TransitionForm({ opportunityId, currentStatus }: { opportunityId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(transitionOpportunityAction, initialTransitionState)
  const [to, setTo] = useState(currentStatus)
  const formId = useId()

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="opportunityId" value={opportunityId} />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${formId}-to`} className="sr-only">
          Cambiar estado
        </label>
        <select
          id={`${formId}-to`}
          name="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-vk-line px-2 py-1.5 text-xs font-bold text-vk-ink"
        >
          {OPPORTUNITY_KANBAN_ORDER.map((status) => (
            <option key={status} value={status}>
              {OPPORTUNITY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || to === currentStatus}
          className="rounded-md bg-vk-navy px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-vk-cobalt disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Guardando…' : 'Cambiar estado'}
        </button>
      </div>

      {to === 'no_aceptado' ? (
        <div>
          <label htmlFor={`${formId}-lossReason`} className="text-xs font-bold text-vk-navy">
            Motivo de pérdida <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-lossReason`}
            name="lossReason"
            required
            rows={2}
            placeholder="Obligatorio para marcar como no aceptada"
            className="mt-1 w-full rounded-md border border-vk-line px-2 py-1.5 text-xs text-vk-ink"
          />
        </div>
      ) : (
        <input type="hidden" name="lossReason" value="" />
      )}

      {state.status === 'error' && state.opportunityId === opportunityId ? (
        <p role="alert" className="text-xs font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}
      {state.status === 'success' && state.opportunityId === opportunityId ? (
        <p role="status" className="text-xs font-semibold text-vk-success">
          Estado actualizado.
        </p>
      ) : null}
    </form>
  )
}
