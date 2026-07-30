'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getRepository } from '@/data'
import { findAuthorizedUser, provisionUser } from '@/lib/auth-provisioning'
import { isDevSignInEnabled } from '@/lib/dev-auth'
import { sendMagicLinkEmail } from '@/lib/magic-link-email'
import { passwordSignInSchema } from '@/lib/schemas/auth'
import { createSession } from '@/lib/session'
import { supabaseAuth } from '@/lib/supabase-auth-client'
import { supabaseAdminAuth } from '@/lib/supabase-admin-auth'

const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

/**
 * Login por correo y contraseña — el metodo principal para uso diario.
 * Reproduce la misma logica de post-verificacion que el callback del
 * magic link (src/app/auth/callback/route.ts): comprobar authorized_users,
 * aprovisionar la fila en `users`, crear la sesion propia. La diferencia es
 * que aqui la verificacion es sincrona (signInWithPassword responde de
 * inmediato) en vez de requerir un correo y una segunda peticion.
 *
 * "Correo o contraseña incorrectos" es un unico mensaje generico para
 * credenciales invalidas Y para cuentas sin contraseña configurada: no se
 * distingue, por la misma razon de no filtrar informacion que ya rige
 * requestMagicLink().
 */
export async function passwordSignInAction(formData: FormData): Promise<void> {
  const parsed = passwordSignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    redirect('/login?error=password_invalido')
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user?.email) {
    redirect('/login?error=password_incorrecto')
  }

  const email = data.user.email.toLowerCase()
  const authorized = await findAuthorizedUser(email)
  if (!authorized || authorized.status !== 'activo') {
    await supabaseAuth.auth.signOut()
    redirect('/login?error=no_autorizado')
  }

  const fullName = (data.user.user_metadata?.full_name as string | undefined) ?? null
  const provisioned = await provisionUser({ id: data.user.id, email, fullName, role: authorized.role })
  if (!provisioned) {
    redirect('/login?error=password_incorrecto')
  }

  const created = await createSession(provisioned)
  if (!created) {
    redirect('/login?error=sin_secreto')
  }

  redirect('/os')
}

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
      // Se registra el motivo real (nunca secretos) para poder diagnosticar
      // desde los logs de Vercel — el mensaje que ve el usuario sigue siendo
      // generico a proposito.
      console.error('requestMagicLink: fallo generateLink', error?.message ?? 'sin hashed_token')
      sendFailed = true
    } else {
      const link = `${redirectTo}?token_hash=${hashedToken}&type=magiclink`
      const result = await sendMagicLinkEmail(parsed.data.email, link)
      if (!result.ok) console.error('requestMagicLink: fallo sendMagicLinkEmail', result.reason)
      sendFailed = !result.ok
    }
  } catch (e) {
    console.error('requestMagicLink: excepcion', e instanceof Error ? e.message : e)
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

  // Se usa el propio userId como actingUserId: todavia no existe sesion (es
  // justo lo que este flujo esta por crear), pero la politica RLS de users
  // permite a cualquiera leer su propia fila (id = auth.uid()), asi que
  // consultarse a si mismo con su propio id funciona sin necesitar una
  // sesion previa.
  const repository = getRepository(userId)
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
