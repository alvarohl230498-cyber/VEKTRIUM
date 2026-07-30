/**
 * Ver la nota en src/app/os/agenda/action-state.ts: un modulo 'use server'
 * solo puede exportar funciones async, asi que el estado inicial vive aqui.
 */
export interface ClientActionState {
  status: 'idle' | 'error' | 'success'
  fieldErrors: Record<string, string>
  formError: string | null
  clientId: string | null
}

export const initialClientActionState: ClientActionState = {
  status: 'idle',
  fieldErrors: {},
  formError: null,
  clientId: null,
}
