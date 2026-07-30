'use server'

import { revalidatePath } from 'next/cache'
import { getRepository } from '@/data'
import { can } from '@/domain/permissions'
import { newClientSchema } from '@/lib/schemas/client'
import { requireSession } from '@/lib/session'
import { initialClientActionState, type ClientActionState } from './action-state'

export async function createClientAction(
  _prevState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const session = await requireSession()
  if (can({ globalRole: session.user.role, action: 'client.create' }) === 'none') {
    return { ...initialClientActionState, status: 'error', formError: 'No tienes permiso para crear clientes.' }
  }

  const raw = {
    legalName: formData.get('legalName') ?? '',
    tradeName: formData.get('tradeName') ?? '',
    ruc: formData.get('ruc') ?? '',
    industry: formData.get('industry') ?? '',
    size: formData.get('size') ?? '',
    city: formData.get('city') ?? '',
    country: formData.get('country') ?? '',
    confidentiality: formData.get('confidentiality') ?? '',
  }

  const parsed = newClientSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ...initialClientActionState, status: 'error', fieldErrors, formError: 'Revisa los campos marcados en rojo.' }
  }

  const repository = getRepository()
  const client = await repository.createClient({
    legalName: parsed.data.legalName,
    tradeName: parsed.data.tradeName,
    ruc: parsed.data.ruc ? parsed.data.ruc : null,
    industry: parsed.data.industry,
    size: parsed.data.size,
    city: parsed.data.city,
    country: parsed.data.country,
    confidentiality: parsed.data.confidentiality,
  })

  revalidatePath('/os/clientes')

  return { ...initialClientActionState, status: 'success', clientId: client.id }
}
