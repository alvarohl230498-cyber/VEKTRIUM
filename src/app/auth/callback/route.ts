import { type NextRequest, NextResponse } from 'next/server'
import { findAuthorizedUser, provisionUser } from '@/lib/auth-provisioning'
import { createSession } from '@/lib/session'
import { supabaseAuth } from '@/lib/supabase-auth-client'

/**
 * Callback del magic link. Supabase, con el flujo de OTP por correo
 * (`signInWithOtp`, sin PKCE configurado en el cliente), redirige aqui con
 * `token_hash` + `type` en la query — no `code` — segun
 * VerifyTokenHashParams en @supabase/auth-js
 * (node_modules/.pnpm/@supabase+auth-js@.../src/lib/types.ts:880-886). El
 * flujo `code` (exchangeCodeForSession) es el de OAuth/PKCE, que no aplica
 * aqui. Por eso se verifica con `supabase.auth.verifyOtp({ token_hash, type })`.
 *
 * No usa adminDb directamente: tests/structure/imports.test.ts y la regla
 * no-restricted-imports de eslint.config.mjs prohiben importar @/db/admin
 * desde CUALQUIER archivo bajo src/app, sin excepcion. La consulta de
 * pre-autenticacion (necesaria porque aqui todavia no hay sesion del
 * portal) vive en src/lib/auth-provisioning.ts.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = request.nextUrl.searchParams.get('type')

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  const { data, error } = await supabaseAuth.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as 'email' | 'magiclink',
  })

  if (error || !data.user?.email) {
    // Se registra el motivo real (nunca el token) para diagnosticar desde
    // los logs de Vercel — el mensaje que ve el usuario sigue siendo generico.
    console.error(
      'auth/callback: fallo verifyOtp',
      error?.message ?? 'sin data.user.email',
      'type=' + type,
    )
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  const email = data.user.email.toLowerCase()

  const authorized = await findAuthorizedUser(email)
  if (!authorized || authorized.status !== 'activo') {
    await supabaseAuth.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=no_autorizado', request.url))
  }

  // El id de la tabla users debe coincidir con el uuid del usuario de
  // Supabase Auth (data.user.id): es el uuid real generado por Supabase para
  // esta identidad, sin relacion con los ids ficticios 'user-juan-diego' /
  // 'user-alvaro' de src/data/memory/seed.ts (esos solo existen en el
  // repositorio en memoria, un almacen completamente separado de Postgres,
  // y bajo correos @vektrium.pe distintos del correo real del magic link).
  const fullName = (data.user.user_metadata?.full_name as string | undefined) ?? null

  const provisioned = await provisionUser({
    id: data.user.id,
    email,
    fullName,
    role: authorized.role,
  })

  if (!provisioned) {
    return NextResponse.redirect(new URL('/login?error=oauth', request.url))
  }

  const created = await createSession(provisioned)
  if (!created) {
    return NextResponse.redirect(new URL('/login?error=sin_secreto', request.url))
  }

  return NextResponse.redirect(new URL('/os', request.url))
}
