'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getRepository } from '@/data'
import { isDevSignInEnabled } from '@/lib/dev-auth'
import { sendMagicLinkEmail } from '@/lib/magic-link-email'
import { createSession } from '@/lib/session'
import { supabaseAdminAuth } from '@/lib/supabase-admin-auth'

const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

/**
 * Envia el magic link. Muestra SIEMPRE el mismo resultado de exito
 * (`?sent=1`) sin importar si el correo esta en `authorized_users` — esa
 * comprobacion ocurre recien en el callback (src/app/auth/callback/route.ts),
 * despues de verificar el token. Hacerlo antes (p. ej. consultando
 * authorized_users aqui para decidir si generar el enlace) filtraria por
 * temporizacion o por rama de codigo que correos estan registrados.
 *
 * No usa supabase.auth.signInWithOtp() (que hace que Supabase envie el
 * correo via su propio SMTP). El SMTP de Supabase, retransmitido por
 * smtp.resend.com, rechaza el remitente de pruebas onboarding@resend.dev:
 * Resend solo permite ese remitente a traves de su API REST, no via SMTP
 * crudo — confirmado por los 500 repetidos en los logs de Auth de Supabase
 * al intentarlo. En vez de depender de un dominio propio verificado en
 * Resend (que VEKTRIUM aun no tiene), se genera el enlace con la API de
 * administracion (supabaseAdminAuth.auth.admin.generateLink, service_role)
 * y se envia por la API REST de Resend (src/lib/magic-link-email.ts), el
 * mismo camino que ya funciona para /contacto. Supabase nunca envia el
 * correo en este flujo — solo emite el token.
 */
export async function requestMagicLink(formData: FormData): Promise<void> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    redirect('/login?error=magic_link_invalido')
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const redirectTo = `${siteUrl}/auth/callback`

  // redirect() de next/navigation lanza internamente para cortar el render:
  // por eso las llamadas a redirect() se mantienen FUERA de este try/catch,
  // en vez de intentar distinguir ese throw especial de un error real.
  let sendFailed = false
  try {
    const { data, error } = await supabaseAdminAuth.auth.admin.generateLink({
      type: 'magiclink',
      email: parsed.data.email,
      options: { redirectTo },
    })

    const hashedToken = data?.properties?.hashed_token
    if (error || !hashedToken) {
      sendFailed = true
    } else {
      const link = `${redirectTo}?token_hash=${hashedToken}&type=magiclink`
      const result = await sendMagicLinkEmail(parsed.data.email, link)
      sendFailed = !result.ok
    }
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
