import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { resources } from '@/site/content'

export const metadata: Metadata = {
  title: 'Recursos',
  description:
    'Recursos VEKTRIUM: demos, plantillas, videos, walkthroughs y acceso privado a Vektrium Proof.',
}

export default function ResourcesPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Recursos"
          title="Material util para decidir sin vender humo."
          copy="El repositorio publico de recursos separa demos, plantillas, walkthroughs y material privado. Lo que no este validado se marca como pendiente."
          actions={
            <>
              <PrimaryLink href="/proyectos">Ver demos</PrimaryLink>
              <SecondaryLink href="/vek-proof">Vektrium Proof</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-4">
            {resources.map((resource) => (
              <article key={resource.title} className="border border-vk-line bg-white p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                  {resource.type}
                </p>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-vk-navy">
                  {resource.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{resource.copy}</p>
                <a
                  className="mt-6 inline-flex text-sm font-extrabold text-vk-cobalt transition hover:text-vk-navy"
                  href={resource.href}
                >
                  Abrir recurso
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Criterio editorial"
              title="Un recurso se publica cuando puede defenderse."
              copy="Los contenidos publicos deben ayudar a entender el metodo, no inflar reputacion ni exponer informacion confidencial."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Casos publicos con autorizacion o anonimato.',
                'Demos con datos ficticios y etiqueta de dato ilustrativo.',
                'Videos solo cuando el contenido este revisado.',
                'Plantillas utiles sin revelar informacion de clientes.',
              ].map((rule) => (
                <article key={rule} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{rule}</p>
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
