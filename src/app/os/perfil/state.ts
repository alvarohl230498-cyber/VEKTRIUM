/**
 * Separado de actions.ts a proposito: un modulo con 'use server' solo puede
 * exportar funciones async, no constantes (mismo patron que
 * src/app/os/agenda/action-state.ts).
 */
export interface SetPasswordState {
  status: 'idle' | 'error' | 'success'
  error: string | null
}

export const initialSetPasswordState: SetPasswordState = {
  status: 'idle',
  error: null,
}
