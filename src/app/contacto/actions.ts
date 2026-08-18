'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendContactRequest } from '@/lib/contact-email'

const contactSchema = z.object({
  nombre: z.string().trim().min(1, 'Ingresa tu nombre'),
  contacto: z.string().trim().min(1, 'Ingresa un correo o telefono'),
  area: z.string().trim().min(1, 'Selecciona un area'),
  necesidad: z.string().trim().min(1, 'Cuentanos que necesitas'),
})

export async function submitContactRequest(formData: FormData): Promise<void> {
  const parsed = contactSchema.safeParse({
    nombre: formData.get('nombre'),
    contacto: formData.get('contacto'),
    area: formData.get('area'),
    necesidad: formData.get('necesidad'),
  })

  if (!parsed.success) {
    redirect('/?error=invalido#agenda')
  }

  const result = await sendContactRequest(parsed.data)

  if (!result.ok) {
    redirect('/?error=envio#agenda')
  }

  redirect('/?enviado=1#agenda')
}
