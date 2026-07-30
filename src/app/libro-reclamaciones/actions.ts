'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendComplaintRequest } from '@/lib/complaint-email'

const complaintSchema = z.object({
  nombre: z.string().trim().min(1, 'Ingresa tu nombre completo'),
  documento: z.string().trim(),
  tipo: z.string().trim().min(1, 'Selecciona un tipo'),
  detalle: z.string().trim().min(1, 'Describe el detalle'),
})

export async function submitComplaintRequest(formData: FormData): Promise<void> {
  const parsed = complaintSchema.safeParse({
    nombre: formData.get('nombre'),
    documento: formData.get('documento'),
    tipo: formData.get('tipo'),
    detalle: formData.get('detalle'),
  })

  if (!parsed.success) {
    redirect('/libro-reclamaciones?error=invalido#formulario')
  }

  const result = await sendComplaintRequest(parsed.data)

  if (!result.ok) {
    redirect('/libro-reclamaciones?error=envio#formulario')
  }

  redirect('/libro-reclamaciones?enviado=1#formulario')
}
