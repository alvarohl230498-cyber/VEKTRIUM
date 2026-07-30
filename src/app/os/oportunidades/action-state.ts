/**
 * Ver la nota en src/app/os/agenda/action-state.ts: un modulo 'use server'
 * solo puede exportar funciones async, asi que el estado inicial de los tres
 * Server Actions de Oportunidades vive aqui.
 */

export interface NewOpportunityActionState {
  status: 'idle' | 'error' | 'success'
  fieldErrors: Record<string, string>
  formError: string | null
  opportunityId: string | null
}

export const initialNewOpportunityState: NewOpportunityActionState = {
  status: 'idle',
  fieldErrors: {},
  formError: null,
  opportunityId: null,
}

export interface TransitionActionState {
  status: 'idle' | 'error' | 'success'
  opportunityId: string | null
  fieldErrors: Record<string, string>
  formError: string | null
}

export const initialTransitionState: TransitionActionState = {
  status: 'idle',
  opportunityId: null,
  fieldErrors: {},
  formError: null,
}

export interface ConvertActionState {
  status: 'idle' | 'error' | 'success'
  fieldErrors: Record<string, string>
  formError: string | null
  projectId: string | null
}

export const initialConvertState: ConvertActionState = {
  status: 'idle',
  fieldErrors: {},
  formError: null,
  projectId: null,
}
