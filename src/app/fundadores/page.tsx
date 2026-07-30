import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { founders } from '@/site/content'

export const metadata: Metadata = {
  title: 'Fundadores',
  description:
    'Fundadores de VEKTRIUM: finanzas, estrategia, operaciones, procesos y producto trabajando juntos.',
}

export default function FoundersPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Fundadores"
          title="Finanzas y operaciones construyendo desde el mismo tablero."
          copy="El sitio evita biografias infladas. La propuesta es simple: criterio financiero, entendimiento operativo y producto digital trabajando juntos."
          actions={
            <>
              <PrimaryLink href="/contacto">Agendar primer reporte</PrimaryLink>
              <SecondaryLink href="/metodo">Ver metodo</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          {founders.map((founder) => (
            <article key={founder.name} className="border border-vk-line bg-white p-6">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                {founder.role}
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-vk-navy">
                {founder.name}
              </h2>
              <p className="mt-5 text-base leading-8 text-vk-muted">{founder.focus}</p>
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-vk-cobalt transition hover:text-vk-navy"
              >
                LinkedIn ↗
              </a>
            </article>
          ))}
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Complementariedad"
              title="La conversacion comercial no se separa de la implementacion."
              copy="Esa mezcla permite ofrecer una consulta y alcance inicial gratuitos sin prometer de mas: primero entendemos, luego entregamos evidencia y recien ahi se paga."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Evaluacion economica antes de escalar alcance.',
                'Primer reporte sin adelanto para probar eficiencia.',
                'Procesos y usuarios reales antes de elegir herramienta.',
                'Documentacion operativa para no depender de memoria.',
                'Criterios de seguridad y permisos desde la fundacion.',
              ].map((principle) => (
                <article key={principle} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{principle}</p>
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
