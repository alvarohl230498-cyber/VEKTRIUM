import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { firstReportOffer, packages } from '@/site/content'

export const metadata: Metadata = {
  title: 'Paquetes',
  description:
    'Paquetes Start, Scale y Partner, con primer reporte sin adelanto para probar VEKTRIUM.',
}

export default function PackagesPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Paquetes"
          title="Empieza con un primer reporte sin adelanto."
          copy="La consulta y el alcance inicial son gratuitos. Si el primer reporte tiene sentido, lo construimos y el pago se realiza cuando te presentamos el resultado terminado."
          actions={
            <>
              <PrimaryLink href="/contacto">Agendar primer reporte</PrimaryLink>
              <SecondaryLink href="/agenda">Ver agenda gratis</SecondaryLink>
            </>
          }
        />

        <section className="border-b border-vk-line bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow={firstReportOffer.eyebrow}
              title={firstReportOffer.headline}
              copy={firstReportOffer.detail}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {firstReportOffer.steps.map((step, index) => (
                <article key={step} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">
                    <span className="mr-2 font-black text-vk-cobalt">{index + 1}.</span>
                    {step}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map((pack) => (
              <article key={pack.name} className="border border-vk-line bg-white p-6">
                <h2 className="font-display text-3xl font-extrabold text-vk-navy">{pack.name}</h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{pack.fit}</p>
                <ul className="mt-6 grid gap-3">
                  {pack.includes.map((item) => (
                    <li key={item} className="border-t border-vk-line pt-3 text-sm leading-6 text-vk-ink">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 rounded-md bg-vk-ice px-3 py-2 text-sm font-extrabold text-vk-cobalt">
                  {pack.name === 'Start'
                    ? 'Sin adelanto: pago al presentar'
                    : 'Cotizacion segun alcance validado'}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Como elegir"
              title="El paquete correcto depende del riesgo y del momento del proceso."
              copy="No todos los problemas necesitan una app. A veces el primer valor esta en ordenar datos, entregar un reporte util o documentar un flujo."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Start si quieres probar con un primer reporte sin adelanto.',
                'Scale si ya existe una solucion candidata y se necesita adopcion.',
                'Partner si la mejora digital debe sostenerse en el tiempo.',
                'Cualquier alcance puede pausarse si la evidencia no justifica construir.',
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
