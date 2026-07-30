'use server'

import { revalidatePath } from 'next/cache'
import { setPasswordSchema } from '@/lib/schemas/auth'
import { requireSession } from '@/lib/session'
import { supabaseAdminAuth } from '@/lib/supabase-admin-auth'
import { initialSetPasswordState, type SetPasswordState } from './state'

/**
 * Fija la contraseña del usuario que ya inicio sesion (con nuestra propia
 * cookie, via requireSession()). No pide la contraseña actual: la identidad
 * ya esta verificada por la sesion, asi que no hay nada que confirmar de
 * nuevo — el mismo principio que un "cambiar contraseña" tras iniciar
 * sesion en cualquier intranet.
 */
export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const session = await requireSession()

  const parsed = setPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Revisa los campos.' }
  }

  const { error } = await supabaseAdminAuth.auth.admin.updateUserById(session.user.id, {
    password: parsed.data.password,
  })
  if (error) {
    console.error('setPasswordAction: fallo updateUserById', error.message)
    return { status: 'error', error: 'No se pudo guardar la contraseña. Intenta nuevamente.' }
  }

  revalidatePath('/os/perfil')
  return { ...initialSetPasswordState, status: 'success' }
}
