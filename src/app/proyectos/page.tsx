import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  ProjectCard,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import {
  projectFilterGroups,
  projectMatchesFilter,
  projects,
  type ProjectFilterKey,
} from '@/site/content'

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Catalogo de casos, demos y prototipos VEKTRIUM con filtros por industria, area, problema y tecnologia.',
}

type ProjectsSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: ProjectsSearchParams
}) {
  const params = await searchParams
  const activeFilters = projectFilterGroups.flatMap((group) => {
    const value = getParamValue(params, group.key)
    return value ? [{ key: group.key, label: group.label, value }] : []
  })
  const visibleProjects =
    activeFilters.length === 0
      ? projects
      : projects.filter((project) =>
          activeFilters.every((filter) => projectMatchesFilter(project, filter.key, filter.value)),
        )

  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Proyectos"
          title="Casos, demos y prototipos sin inflar resultados."
          copy="El catalogo distingue trabajo real, demos con datos ficticios y prototipos. Toda cifra ilustrativa queda marcada como tal."
          actions={
            <>
              <PrimaryLink href="/contacto">Solicitar diagnostico</PrimaryLink>
              <SecondaryLink href="/vek-proof">Ver Vektrium Proof</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="border border-vk-line bg-white p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-vk-navy">Filtros</h2>
                <p className="mt-2 text-sm leading-6 text-vk-muted">
                  Filtra por tipo, industria, area, problema o tecnologia.
                </p>
              </div>
              <Link
                className="inline-flex rounded-md border border-vk-line px-3 py-2 text-sm font-extrabold text-vk-navy hover:border-vk-cobalt hover:text-vk-cobalt"
                href="/proyectos"
              >
                Limpiar filtros
              </Link>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-5">
              {projectFilterGroups.map((group) => (
                <div key={group.key}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                    {group.label}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.values.map((value) => (
                      <Link
                        key={value}
                        className="rounded-md bg-vk-ice px-3 py-2 text-xs font-bold text-vk-navy transition hover:bg-vk-cobalt hover:text-white"
                        href={filterHref(group.key, value)}
                      >
                        {value}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <SectionIntro
              eyebrow="Catalogo"
              title={
                activeFilters.length > 0
                  ? `Resultados para ${activeFilters.map((filter) => filter.value).join(', ')}`
                  : 'Todos los proyectos disponibles'
              }
              copy="Los casos reales se publican solo con autorizacion escrita o anonimizada. Por ahora el catalogo prioriza demos y prototipos honestos."
            />
            <p className="text-sm font-bold text-vk-muted">{visibleProjects.length} resultado(s)</p>
          </div>

          {visibleProjects.length > 0 ? (
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-vk-line bg-white p-6">
              <h3 className="font-display text-2xl font-extrabold text-vk-navy">
                Todavia no hay un proyecto publico con ese filtro.
              </h3>
              <p className="mt-3 text-sm leading-7 text-vk-muted">
                Eso es intencional: VEKTRIUM no inventa clientes, cifras ni casos. Se publica cuando
                exista demo validada, prototipo o autorizacion de cliente.
              </p>
            </div>
          )}
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              {
                title: 'Caso real',
                copy: 'Trabajo entregado a un cliente. Requiere autorizacion escrita o anonimizada antes de publicarse.',
              },
              {
                title: 'Demo',
                copy: 'Producto funcional construido por VEKTRIUM con datos ficticios y etiquetas de dato ilustrativo.',
              },
              {
                title: 'Prototipo',
                copy: 'Prueba de concepto no productiva para validar flujo, experiencia y factibilidad.',
              },
            ].map((type) => (
              <article key={type.title} className="border border-vk-line bg-vk-ice p-6">
                <h2 className="font-display text-2xl font-extrabold text-vk-navy">{type.title}</h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{type.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}

function getParamValue(
  params: Record<string, string | string[] | undefined>,
  key: ProjectFilterKey,
) {
  const raw = params[key]
  if (Array.isArray(raw)) {
    return raw[0]
  }
  return raw
}

function filterHref(key: ProjectFilterKey, value: string) {
  return `/proyectos?${key}=${encodeURIComponent(value)}`
}
