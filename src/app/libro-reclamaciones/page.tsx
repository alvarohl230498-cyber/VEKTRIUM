import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { submitComplaintRequest } from './actions'

export const metadata: Metadata = {
  title: 'Libro de reclamaciones',
  description: 'Libro de reclamaciones de VEKTRIUM: registra tu queja o reclamo.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ERROR_MESSAGES: Record<string, string> = {
  invalido: 'Revisa el formulario: falta completar algun campo.',
  envio: 'No se pudo registrar tu reclamo. Intenta nuevamente en unos minutos o escribe por WhatsApp.',
}

export default async function ClaimsBookPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const rawError = params.error
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.envio) : null

  const rawEnviado = params.enviado
  const enviado = (Array.isArray(rawEnviado) ? rawEnviado[0] : rawEnviado) === '1'

  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Libro de reclamaciones"
          title="Registra tu queja o reclamo."
          copy="Completa tus datos y el detalle del caso. El equipo de VEKTRIUM revisa cada registro y se pone en contacto para resolverlo."
          actions={
            <>
              <PrimaryLink href="#formulario">Registrar reclamo</PrimaryLink>
              <SecondaryLink href="/#agenda">Ir a contacto</SecondaryLink>
            </>
          }
        />

        <section id="formulario" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Informacion"
              title="Cuentanos que paso, con el mayor detalle posible."
              copy="El registro llega directo al equipo de VEKTRIUM. Cuanto mas preciso el detalle, mas rapido podemos darle seguimiento."
            />
          </div>

          {enviado ? (
            <div className="space-y-4 border border-vk-line bg-white p-5">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Reclamo registrado</h2>
              <p role="status" className="text-sm leading-7 text-vk-muted">
                Recibimos tu registro. El equipo de VEKTRIUM te contactara para darle seguimiento.
              </p>
            </div>
          ) : (
            <form action={submitComplaintRequest} className="space-y-4 border border-vk-line bg-white p-5">
              {errorMessage ? (
                <p
                  role="alert"
                  className="rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger"
                >
                  {errorMessage}
                </p>
              ) : null}
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Nombre completo</span>
                <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="nombre" required />
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Documento o identificacion</span>
                <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="documento" />
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Tipo</span>
                <select className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="tipo" required>
                  <option value="">Seleccionar</option>
                  <option>Queja</option>
                  <option>Reclamo</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Detalle</span>
                <textarea className="mt-2 min-h-32 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="detalle" required />
              </label>
              <button className="w-full rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy" type="submit">
                Registrar reclamo
              </button>
            </form>
          )}
        </section>
      </main>
    </PublicShell>
  )
}
