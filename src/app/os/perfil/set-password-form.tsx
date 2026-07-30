'use client'

import { useActionState } from 'react'
import { setPasswordAction } from './actions'
import { initialSetPasswordState } from './state'

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPasswordAction, initialSetPasswordState)

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-bold text-vk-navy">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-bold text-vk-navy">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
        />
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm font-semibold text-vk-danger">
          {state.error}
        </p>
      ) : null}
      {state.status === 'success' ? (
        <p role="status" className="text-sm font-semibold text-vk-success">
          Contraseña guardada. La próxima vez puedes entrar directo con tu correo y contraseña.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-vk-cobalt px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  )
}
