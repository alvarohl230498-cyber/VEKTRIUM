import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { submitContactRequest } from './actions'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Solicita un Diagnostico Vektor por formulario, agenda o canal empresarial preparado para WhatsApp.',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ERROR_MESSAGES: Record<string, string> = {
  invalido: 'Revisa el formulario: falta completar algun campo.',
  envio: 'No se pudo enviar la solicitud. Intenta nuevamente en unos minutos o escribe por WhatsApp.',
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
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
          eyebrow="Contacto"
          title="Solicita un Diagnostico Vektor."
          copy="Cuentanos que proceso consume tiempo, que reporte no llega a decision o que operacion necesita mas control."
          actions={
            <>
              <PrimaryLink href="#formulario">Completar formulario</PrimaryLink>
              <SecondaryLink href="/agenda">Ver agenda</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            ['Formulario', 'Levanta necesidad, datos disponibles, urgencia y contacto.', '#formulario'],
            ['Agenda', 'Reserva una primera conversacion para ubicar alcance.', '/agenda'],
            ['WhatsApp empresarial', 'Canal preparado para conectar el numero oficial.', '#whatsapp'],
          ].map(([title, copy, href]) => (
            <a key={title} className="border border-vk-line bg-white p-5" href={href}>
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-vk-muted">{copy}</p>
            </a>
          ))}
        </section>

        <section id="formulario" className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Solicitud"
              title="Mientras mas concreto el dolor, mejor el diagnostico."
              copy="Este formulario queda listo para conectarse al backend o herramienta comercial que definan los fundadores."
            />
            <div id="solicitud-recibida" className="mt-8 border border-vk-line bg-white p-5">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Ruta esperada</h2>
              <ol className="mt-4 grid gap-3 text-sm leading-7 text-vk-muted">
                <li>1. Revisar proceso, area, urgencia y datos disponibles.</li>
                <li>2. Confirmar una sesion de diagnostico.</li>
                <li>3. Proponer siguiente paso con alcance y evidencia minima.</li>
              </ol>
            </div>
          </div>

          {enviado ? (
            <div className="space-y-4 border border-vk-line bg-white p-5">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Solicitud enviada</h2>
              <p role="status" className="text-sm leading-7 text-vk-muted">
                Recibimos tu solicitud. El equipo de VEKTRIUM te contactara para coordinar el
                diagnostico.
              </p>
            </div>
          ) : (
            <form action={submitContactRequest} className="space-y-4 border border-vk-line bg-white p-5">
              {errorMessage ? (
                <p
                  role="alert"
                  className="rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger"
                >
                  {errorMessage}
                </p>
              ) : null}
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Nombre</span>
                <input
                  className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt"
                  name="nombre"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Correo o telefono</span>
                <input
                  className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt"
                  name="contacto"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Area</span>
                <select
                  className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt"
                  name="area"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option>Finanzas</option>
                  <option>Recursos Humanos</option>
                  <option>Operaciones</option>
                  <option>Comercial</option>
                  <option>Direccion</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-extrabold text-vk-navy">Necesidad</span>
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt"
                  name="necesidad"
                  required
                />
              </label>
              <button
                className="w-full rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy"
                type="submit"
              >
                Enviar solicitud
              </button>
              <p className="text-xs leading-5 text-vk-muted">
                Al enviar la solicitud aceptas que el equipo use estos datos para responder el
                diagnostico. Revisa privacidad y terminos antes de publicar el sitio.
              </p>
            </form>
          )}
        </section>

        <section id="whatsapp" className="border-y border-vk-line bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:px-8">
            <SectionIntro
              eyebrow="WhatsApp empresarial"
              title="Canal preparado para el numero oficial."
              copy="El spec pide WhatsApp empresarial, pero no hay numero confirmado en los documentos. El enlace externo debe activarse cuando Juan Diego y Alvaro validen el canal oficial."
            />
            <PrimaryLink href="/agenda">Usar agenda mientras tanto</PrimaryLink>
          </div>
        </section>
      </main>
    </PublicShell>
  )
}
