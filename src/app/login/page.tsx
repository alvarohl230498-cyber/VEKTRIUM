import type { Metadata } from 'next'
import { brand } from '@/site/content'
import { DEV_SIGN_IN_USERS, isDevSignInEnabled } from '@/lib/dev-auth'
import { devSignIn, requestMagicLink } from './actions'

export const metadata: Metadata = {
  title: 'Ingresar',
  robots: {
    index: false,
    follow: false,
  },
}

const ERROR_MESSAGES: Record<string, string> = {
  no_autorizado:
    'Ese correo no esta autorizado para VEKTRIUM OS. Pide a un fundador que lo agregue a la lista de acceso.',
  oauth: 'No se pudo completar el inicio de sesion. El enlace puede haber expirado: solicita uno nuevo.',
  dev_produccion: 'El acceso de desarrollo esta deshabilitado en produccion.',
  dev_invalido: 'No se pudo iniciar sesion con ese usuario de desarrollo.',
  sin_secreto:
    'Falta configurar SESSION_SECRET en este entorno, asi que no se puede firmar la sesion.',
  magic_link_invalido: 'Ingresa un correo valido.',
  magic_link_error: 'No se pudo enviar el enlace de acceso. Intenta nuevamente en unos minutos.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const rawError = params.error
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.oauth) : null

  const rawSent = params.sent
  const magicLinkSent = (Array.isArray(rawSent) ? rawSent[0] : rawSent) === '1'

  const devSignInEnabled = isDevSignInEnabled()

  return (
    <main className="flex min-h-screen items-center justify-center bg-vk-navy px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-white/10 bg-white p-8 shadow-vk">
        <p className="font-display text-2xl font-extrabold text-vk-navy">{brand.name} OS</p>
        <p className="mt-2 text-sm leading-6 text-vk-muted">
          Portal privado de gestion. Acceso exclusivo para el equipo autorizado de VEKTRIUM.
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-8">
          {magicLinkSent ? (
            <p
              role="status"
              className="rounded-md border border-vk-cobalt/30 bg-vk-cobalt/10 px-4 py-3 text-sm font-semibold text-vk-navy"
            >
              Si ese correo tiene acceso a VEKTRIUM OS, te enviamos un enlace de ingreso. Revisa tu
              correo (incluida la carpeta de spam).
            </p>
          ) : (
            <form action={requestMagicLink} className="space-y-3">
              <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                Correo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nombre@vektrium.pe"
                className="w-full rounded-md border border-vk-line px-4 py-3 text-sm text-vk-navy outline-none focus:border-vk-cobalt"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-90"
              >
                Enviar enlace de acceso
              </button>
            </form>
          )}
        </div>

        <div className="mt-8">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-vk-line bg-vk-ice px-4 py-3 text-sm font-extrabold text-vk-muted"
          >
            Continuar con Google
          </button>
          <p className="mt-3 text-xs leading-5 text-vk-muted">
            El ingreso con Google todavia no esta activo: se habilita cuando el proyecto Supabase
            de VEKTRIUM quede conectado. Este boton no funciona y no lo hara hasta entonces.
          </p>
        </div>

        {devSignInEnabled ? (
          <div className="mt-8 border-t border-vk-line pt-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
              Acceso de desarrollo
            </p>
            <p className="mt-2 text-xs leading-5 text-vk-muted">
              Disponible solo fuera de produccion, mientras Google no esta conectado. Elige un
              usuario para entrar directamente.
            </p>
            <div className="mt-4 space-y-2">
              {DEV_SIGN_IN_USERS.map((user) => (
                <form key={user.id} action={devSignIn}>
                  <input type="hidden" name="userId" value={user.id} />
                  <button
                    type="submit"
                    className="w-full rounded-md border border-vk-line px-4 py-3 text-left text-sm font-bold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
                  >
                    Entrar como {user.label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
