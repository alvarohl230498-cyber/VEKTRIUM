import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { packages } from '@/site/content'

export const metadata: Metadata = {
  title: 'Paquetes',
  description:
    'Paquetes Start, Scale y Partner para diagnostico, implementacion y mejora continua sin montos inventados.',
}

export default function PackagesPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Paquetes"
          title="Alcances claros para empezar chico y escalar con evidencia."
          copy="El spec exige no inventar montos ni resultados. Por eso los paquetes ordenan alcance, entregables y decision de avance."
          actions={
            <>
              <PrimaryLink href="/contacto">Cotizar segun alcance</PrimaryLink>
              <SecondaryLink href="/agenda">Agendar conversacion</SecondaryLink>
            </>
          }
        />

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
                  Cotizacion segun diagnostico y alcance
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
              copy="No todos los problemas necesitan una app. A veces el primer valor esta en ordenar datos, automatizar un reporte o documentar un flujo."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Start si aun no hay linea base ni alcance claro.',
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
