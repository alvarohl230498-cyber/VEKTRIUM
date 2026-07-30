import type { Metadata } from 'next'
import { requireSession } from '@/lib/session'
import { SetPasswordForm } from './set-password-form'

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false, follow: false },
}

export default async function PerfilPage() {
  const session = await requireSession()

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-2xl font-extrabold text-vk-navy">Mi perfil</h1>
      <p className="mt-1 text-sm text-vk-muted">{session.user.fullName} · {session.user.email}</p>

      <section className="mt-8 border border-vk-line bg-white p-6">
        <h2 className="font-display text-lg font-extrabold text-vk-navy">Contraseña</h2>
        <p className="mt-1 text-sm leading-6 text-vk-muted">
          Fija una contraseña para entrar directamente con tu correo, sin esperar el enlace por
          correo cada vez. El enlace por correo sigue disponible como respaldo.
        </p>
        <SetPasswordForm />
      </section>
    </div>
  )
}
