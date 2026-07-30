import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { ProjectsCarouselSection } from '@/components/site/projects-carousel'

export const metadata: Metadata = {
  title: 'Proyectos desarrollados',
  description:
    'Portafolio visual de soluciones VEKTRIUM: automatizaciones, aplicaciones, dashboards, analitica financiera y Recursos Humanos.',
}

export default function ProjectsPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Portafolio VEKTRIUM"
          title="Proyectos reales presentados como una experiencia visual."
          copy="El portafolio ahora vive en un carrusel unico: imagen primero, contexto despues, sin duplicar tarjetas ni mezclar piezas que compitan entre si."
          actions={
            <>
              <PrimaryLink href="/contacto?motivo=proyectos">Agendar primer reporte</PrimaryLink>
              <SecondaryLink href="/servicios">Ver servicios</SecondaryLink>
            </>
          }
        />

        <ProjectsCarouselSection />

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Criterio de portafolio"
              title="Una sola lectura, sin inflar resultados."
              copy="La pagina no repite el portafolio en tarjetas grandes porque el carrusel es la pieza central. Cada proyecto muestra responsable, categoria, capacidades, tecnologia e imagen real del alcance trabajado."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Las imagenes se muestran completas con object-fit contain.',
                'Los textos vienen del JSON del carrusel.',
                'Las capacidades se limitan a cuatro puntos por proyecto.',
                'El CTA lleva al formulario para iniciar consulta y alcance gratuitos.',
              ].map((criterion) => (
                <article key={criterion} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{criterion}</p>
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
