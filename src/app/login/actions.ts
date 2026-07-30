'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getRepository } from '@/data'
import { isDevSignInEnabled } from '@/lib/dev-auth'
import { createSession } from '@/lib/session'
import { supabaseAuth } from '@/lib/supabase-auth-client'

const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

/**
 * Envia el magic link. Muestra SIEMPRE el mismo resultado de exito
 * (`?sent=1`) sin importar si el correo esta en `authorized_users` — esa
 * comprobacion ocurre recien en el callback (src/app/auth/callback/route.ts),
 * despues de verificar el token. Hacerlo antes (p. ej. consultando
 * authorized_users aqui para decidir si llamar a signInWithOtp) filtrarma
 * por temporizacion o por rama de codigo que correos estan registrados.
 *
 * Solo se distingue un error de validacion de formato (no es un correo) de
 * un fallo real de Supabase al enviar — ninguno de los dos revela nada sobre
 * autorizacion, solo sobre el propio intento de envio.
 */
export async function requestMagicLink(formData: FormData): Promise<void> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    redirect('/login?error=magic_link_invalido')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  // redirect() de next/navigation lanza internamente para cortar el render:
  // por eso las llamadas a redirect() se mantienen FUERA de este try/catch
  // (que solo envuelve la llamada de red a Supabase), en vez de intentar
  // distinguir ese throw especial de un error real dentro de un catch.
  let sendFailed = false
  try {
    // `options` se omite por completo (en vez de fijarse en `undefined`)
    // cuando no hay NEXT_PUBLIC_SITE_URL: con exactOptionalPropertyTypes,
    // { options: undefined } no es asignable a una propiedad opcional.
    const { error } = await supabaseAuth.auth.signInWithOtp({
      email: parsed.data.email,
      ...(siteUrl ? { options: { emailRedirectTo: `${siteUrl}/auth/callback` } } : {}),
    })
    sendFailed = Boolean(error)
  } catch {
    sendFailed = true
  }

  if (sendFailed) {
    redirect('/login?error=magic_link_error')
  }

  redirect('/login?sent=1')
}

/**
 * Entrada de desarrollo: crea una sesion para el usuario elegido sin Google
 * ni Supabase. Debe ser inerte en produccion sin excepcion — es la puerta de
 * acceso al portal, y NODE_ENV=production es la unica senal en la que se
 * puede confiar porque la fija Vercel, no un valor que el cliente controle.
 *
 * tests/unit/dev-auth.test.ts prueba directamente `isDevSignInEnabled`, que
 * es la funcion que decide esto; aqui solo se aplica el resultado.
 */
export async function devSignIn(formData: FormData): Promise<void> {
  if (!isDevSignInEnabled()) {
    redirect('/login?error=dev_produccion')
  }

  const userId = formData.get('userId')
  if (typeof userId !== 'string' || userId.length === 0) {
    redirect('/login?error=dev_invalido')
  }

  const repository = getRepository()
  const user = await repository.getUserById(userId)
  if (!user) {
    redirect('/login?error=dev_invalido')
  }

  const created = await createSession(user)
  if (!created) {
    // Sin SESSION_SECRET no hay con que firmar. No se emite un cookie inutil.
    redirect('/login?error=sin_secreto')
  }

  redirect('/os')
}
