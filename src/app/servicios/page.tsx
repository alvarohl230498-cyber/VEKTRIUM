import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { firstReportOffer, services } from '@/site/content'

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Automatizacion de procesos, data, reporting, dashboards, portales internos, AI responsable y mejora continua.',
}

export default function ServicesPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Servicios"
          title="Tecnologia aplicada a procesos que ya entendimos bien."
          copy="Cada servicio existe para resolver una friccion concreta: trabajo manual, reportes dispersos, falta de trazabilidad, adopcion debil o datos que no llegan a decision."
          actions={
            <>
              <PrimaryLink href="/contacto">Agendar primer reporte</PrimaryLink>
              <SecondaryLink href="/proyectos">Ver proyectos</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.slug} id={service.slug} className="border border-vk-line bg-white p-6">
                <h2 className="font-display text-2xl font-extrabold text-vk-navy">{service.title}</h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{service.summary}</p>
                <ul className="mt-6 grid gap-3">
                  {service.deliverables.map((deliverable) => (
                    <li key={deliverable} className="border-t border-vk-line pt-3 text-sm leading-6 text-vk-ink">
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow={firstReportOffer.eyebrow}
              title="Antes de construir grande, validamos con un primer reporte."
              copy="La consulta y el alcance inicial son gratuitos. Si hay un reporte concreto que podamos entregar, trabajamos sin adelanto y pagas al final, cuando te presentamos el resultado."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Proceso actual y puntos de friccion.',
                'Datos disponibles, calidad y responsables.',
                'Usuarios, permisos y frecuencia de uso.',
                'Riesgos operativos, legales y de continuidad.',
                'Indicadores y linea base posible.',
                'Pago al presentar el primer reporte terminado.',
              ].map((item) => (
                <article key={item} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
