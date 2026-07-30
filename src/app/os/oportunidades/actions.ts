'use server'

import { revalidatePath } from 'next/cache'
import { getRepository } from '@/data'
import { can } from '@/domain/permissions'
import {
  convertOpportunitySchema,
  newOpportunitySchema,
  opportunityTransitionSchema,
} from '@/lib/schemas/opportunity'
import { requireSession } from '@/lib/session'
import {
  initialConvertState,
  initialNewOpportunityState,
  initialTransitionState,
  type ConvertActionState,
  type NewOpportunityActionState,
  type TransitionActionState,
} from './action-state'

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return fieldErrors
}

// --- Crear oportunidad -------------------------------------------------

export async function createOpportunityAction(
  _prevState: NewOpportunityActionState,
  formData: FormData,
): Promise<NewOpportunityActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'opportunity.create' }) === 'none') {
    return { ...initialNewOpportunityState, status: 'error', formError: 'No tienes permiso para crear oportunidades.' }
  }

  const raw = {
    clientId: formData.get('clientId') ?? '',
    title: formData.get('title') ?? '',
    expectedAmount: formData.get('expectedAmount') ?? '',
    ownerId: formData.get('ownerId') ?? '',
  }

  const parsed = newOpportunitySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ...initialNewOpportunityState,
      status: 'error',
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      formError: 'Revisa los campos marcados en rojo.',
    }
  }

  const repository = getRepository()
  const opportunity = await repository.createOpportunity({
    clientId: parsed.data.clientId,
    title: parsed.data.title,
    expectedAmount: Number(parsed.data.expectedAmount),
    ownerId: parsed.data.ownerId,
  })

  revalidatePath('/os/oportunidades')
  revalidatePath('/os/clientes')

  return { ...initialNewOpportunityState, status: 'success', opportunityId: opportunity.id }
}

// --- Cambiar de estado ---------------------------------------------------

/**
 * `transitionOpportunity()` del dominio es la unica autoridad sobre que
 * transiciones son validas y sobre exigir motivo de perdida al pasar a
 * 'no_aceptado'. Este action solo la aplica y traduce su Result a estado de
 * formulario; el mensaje de error que ve el usuario es el mismo que produce
 * el dominio (regla del brief).
 */
export async function transitionOpportunityAction(
  _prevState: TransitionActionState,
  formData: FormData,
): Promise<TransitionActionState> {
  const session = await requireSession()
  const opportunityId = String(formData.get('opportunityId') ?? '')

  if (can({ globalRole: session.user.role, action: 'opportunity.update' }) === 'none') {
    return { ...initialTransitionState, status: 'error', opportunityId, formError: 'No tienes permiso para cambiar el estado de esta oportunidad.' }
  }

  const raw = {
    opportunityId,
    to: formData.get('to') ?? '',
    lossReason: formData.get('lossReason') ?? '',
  }

  const parsed = opportunityTransitionSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ...initialTransitionState,
      status: 'error',
      opportunityId,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      formError: 'Revisa los campos marcados en rojo.',
    }
  }

  const repository = getRepository()
  const ctx = parsed.data.lossReason.trim() ? { lossReason: parsed.data.lossReason.trim() } : {}
  const result = await repository.updateOpportunityStatus(parsed.data.opportunityId, parsed.data.to, ctx)

  if (result === null) {
    return { ...initialTransitionState, status: 'error', opportunityId, formError: 'La oportunidad ya no existe.' }
  }
  if (!result.ok) {
    return { ...initialTransitionState, status: 'error', opportunityId, formError: result.error.message }
  }

  revalidatePath('/os/oportunidades')
  revalidatePath(`/os/oportunidades/${parsed.data.opportunityId}`)
  revalidatePath('/os/clientes')

  return { ...initialTransitionState, status: 'success', opportunityId }
}

// --- Convertir en proyecto ------------------------------------------------

export async function convertOpportunityAction(
  _prevState: ConvertActionState,
  formData: FormData,
): Promise<ConvertActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'project.create' }) === 'none') {
    return { ...initialConvertState, status: 'error', formError: 'No tienes permiso para crear proyectos.' }
  }

  const raw = {
    opportunityId: formData.get('opportunityId') ?? '',
    name: formData.get('name') ?? '',
    ownerId: formData.get('ownerId') ?? '',
    startDate: formData.get('startDate') ?? '',
    targetDate: formData.get('targetDate') ?? '',
  }

  const parsed = convertOpportunitySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ...initialConvertState,
      status: 'error',
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      formError: 'Revisa los campos marcados en rojo.',
    }
  }

  const repository = getRepository()
  const result = await repository.convertOpportunityToProject(parsed.data.opportunityId, {
    name: parsed.data.name,
    ownerId: parsed.data.ownerId,
    startDate: parsed.data.startDate,
    targetDate: parsed.data.targetDate,
  })

  if (result === null) {
    return { ...initialConvertState, status: 'error', formError: 'La oportunidad ya no existe.' }
  }
  if (!result.ok) {
    return { ...initialConvertState, status: 'error', formError: result.error.message }
  }

  revalidatePath('/os/oportunidades')
  revalidatePath(`/os/oportunidades/${parsed.data.opportunityId}`)
  revalidatePath('/os/proyectos')
  revalidatePath('/os/clientes')

  return { ...initialConvertState, status: 'success', projectId: result.value.id }
}
