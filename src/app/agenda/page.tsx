import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { firstReportOffer } from '@/site/content'

export const metadata: Metadata = {
  title: 'Agenda',
  description:
    'Agenda una consulta gratuita para definir el alcance de tu primer reporte VEKTRIUM sin adelanto.',
}

export default function AgendaPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Agenda gratis"
          title="Agenda tu primer reporte sin adelanto."
          copy="Consulta y alcance inicial gratuitos. Revisamos tu proceso, definimos que reporte conviene construir y el pago llega al final, cuando te presentamos el resultado terminado."
          actions={
            <>
              <PrimaryLink href="/contacto">Quiero agendar</PrimaryLink>
              <SecondaryLink href="/proyectos">Ver proyectos</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Oferta"
              title="Prueba nuestra eficiencia con un primer reporte."
              copy="La primera conversacion no se cobra. Tampoco cobramos por definir el alcance inicial: queremos que veas si nuestra forma de trabajar realmente te ayuda."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Consulta inicial gratuita para entender el proceso.',
                'Alcance inicial gratuito con datos, responsables y entregable.',
                'Primer reporte acordado antes de escalar a un proyecto mayor.',
                'Pago al finalizar, cuando el resultado se presenta terminado.',
              ].map((item) => (
                <article key={item} className="border border-vk-line bg-white p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{item}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="border border-vk-line bg-white p-6">
            <h2 className="font-display text-2xl font-extrabold text-vk-navy">Asi funciona</h2>
            <div className="mt-6 grid gap-3">
              {firstReportOffer.steps.map((step, index) => (
                <div key={step} className="rounded-md bg-vk-ice px-4 py-3 text-sm font-bold leading-6 text-vk-navy">
                  <span className="mr-2 font-black text-vk-cobalt">{index + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-vk-muted">
              {firstReportOffer.note}
            </p>
            <div className="mt-6">
              <PrimaryLink href="/contacto">Solicitar agenda gratis</PrimaryLink>
            </div>
          </aside>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
