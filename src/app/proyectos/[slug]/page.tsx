import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { getProjectBySlug, projects } from '@/site/content'

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    }
  }

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} | VEKTRIUM`,
      description: project.summary,
      images: [project.image ?? '/hero-vektrium.png'],
    },
  }
}

export default async function ProjectCasePage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow={`${project.kind} - ${project.label}`}
          title={project.title}
          copy={project.summary}
          actions={
            <>
              <PrimaryLink href="/contacto">Agendar reporte similar</PrimaryLink>
              <SecondaryLink href="/proyectos">Volver a proyectos</SecondaryLink>
            </>
          }
        />

        {project.image ? (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[21/9] w-full overflow-hidden border border-vk-line">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
          </section>
        ) : null}

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            ['Industria', project.industry],
            ['Area', project.area],
            ['Problema', project.problem],
            ['Tecnologia', project.technology],
          ].map(([label, value]) => (
            <article key={label} className="border border-vk-line bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                {label}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-vk-navy">{value}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          <div className="grid gap-6">
            {[
              ['Contexto', project.context],
              ['Linea base', project.baseline],
              ['Usuarios', project.users],
              ['Solucion', project.solution],
              ['Resultado', project.result],
            ].map(([title, copy]) => (
              <article key={title} className="border border-vk-line bg-white p-6">
                <h2 className="font-display text-2xl font-extrabold text-vk-navy">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{copy}</p>
              </article>
            ))}

            <article className="border border-vk-line bg-white p-6">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">
                Arquitectura funcional
              </h2>
              <ul className="mt-5 grid gap-3">
                {project.architecture.map((item) => (
                  <li key={item} className="border-t border-vk-line pt-3 text-sm leading-7 text-vk-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-vk-line bg-white p-6">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">
                Riesgos y aprendizajes
              </h2>
              <ul className="mt-5 grid gap-3">
                {project.risks.map((risk) => (
                  <li key={risk} className="border-t border-vk-line pt-3 text-sm leading-7 text-vk-ink">
                    {risk}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <aside className="h-fit border border-vk-line bg-white p-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="rounded-md bg-vk-ice px-3 py-2 text-xs font-bold text-vk-navy">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 border-t border-vk-line pt-6">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">
                Criterio de publicacion
              </h2>
              <p className="mt-4 text-sm leading-7 text-vk-muted">
                Los demos y prototipos no exponen datos reales, y los casos reales requieren
                autorizacion antes de publicarse.
              </p>
            </div>
            <Link
              className="mt-8 inline-flex rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy"
              href="/contacto"
            >
              Agendar primer reporte
            </Link>
          </aside>
        </section>

        <section className="border-y border-vk-line bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="Siguiente paso"
              title="El valor esta en adaptar el patron a tu proceso real."
              copy="Los demos muestran capacidad tecnica. La consulta y el alcance inicial son gratuitos para definir si podemos entregar un primer reporte similar sin adelanto."
            />
          </div>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
