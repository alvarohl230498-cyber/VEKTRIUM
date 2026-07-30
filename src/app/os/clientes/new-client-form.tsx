'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import { initialClientActionState } from './action-state'
import { createClientAction } from './actions'

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
      {message}
    </p>
  )
}

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClientAction, initialClientActionState)
  const formRef = useRef<HTMLFormElement>(null)
  const formId = useId()

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state.status])

  return (
    <details className="border border-vk-line bg-white p-6">
      <summary className="cursor-pointer font-display text-xl font-extrabold text-vk-navy">
        Nuevo cliente
      </summary>

      {state.status === 'success' ? (
        <p role="status" className="mt-4 rounded-md border border-vk-success/30 bg-vk-success/10 px-4 py-3 text-sm font-semibold text-vk-success">
          Cliente creado correctamente.
        </p>
      ) : null}
      {state.formError ? (
        <p role="alert" className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-legalName`} className="text-sm font-bold text-vk-navy">
            Razón social <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-legalName`}
            name="legalName"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.legalName} />
        </div>

        <div>
          <label htmlFor={`${formId}-tradeName`} className="text-sm font-bold text-vk-navy">
            Nombre comercial <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-tradeName`}
            name="tradeName"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.tradeName} />
        </div>

        <div>
          <label htmlFor={`${formId}-ruc`} className="text-sm font-bold text-vk-navy">
            RUC (opcional)
          </label>
          <input
            id={`${formId}-ruc`}
            name="ruc"
            type="text"
            inputMode="numeric"
            maxLength={11}
            placeholder="11 dígitos"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.ruc} />
        </div>

        <div>
          <label htmlFor={`${formId}-industry`} className="text-sm font-bold text-vk-navy">
            Rubro <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-industry`}
            name="industry"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.industry} />
        </div>

        <div>
          <label htmlFor={`${formId}-size`} className="text-sm font-bold text-vk-navy">
            Tamaño <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-size`}
            name="size"
            required
            defaultValue="pequena"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            <option value="micro">Micro</option>
            <option value="pequena">Pequeña</option>
            <option value="mediana">Mediana</option>
            <option value="grande">Grande</option>
          </select>
          <FieldError message={state.fieldErrors.size} />
        </div>

        <div>
          <label htmlFor={`${formId}-confidentiality`} className="text-sm font-bold text-vk-navy">
            Confidencialidad <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-confidentiality`}
            name="confidentiality"
            required
            defaultValue="interno"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            <option value="publico">Público</option>
            <option value="interno">Interno</option>
            <option value="confidencial">Confidencial</option>
          </select>
          <FieldError message={state.fieldErrors.confidentiality} />
        </div>

        <div>
          <label htmlFor={`${formId}-city`} className="text-sm font-bold text-vk-navy">
            Ciudad <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-city`}
            name="city"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.city} />
        </div>

        <div>
          <label htmlFor={`${formId}-country`} className="text-sm font-bold text-vk-navy">
            País <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-country`}
            name="country"
            type="text"
            required
            defaultValue="Perú"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.country} />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-vk-cobalt px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar cliente'}
          </button>
        </div>
      </form>
    </details>
  )
}
