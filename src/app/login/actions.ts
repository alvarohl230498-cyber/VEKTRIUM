'use server'

import { redirect } from 'next/navigation'
import { getRepository } from '@/data'
import { isDevSignInEnabled } from '@/lib/dev-auth'
import { createSession } from '@/lib/session'

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
