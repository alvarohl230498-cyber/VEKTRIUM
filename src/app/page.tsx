import Link from 'next/link'
import {
  ContactBand,
  HeroImage,
  PrimaryLink,
  ProjectCard,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import {
  brand,
  founders,
  methodSteps,
  packages,
  problems,
  projects,
  services,
  trustSignals,
} from '@/site/content'

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="relative isolate min-h-[82vh] overflow-hidden">
          <HeroImage />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(242,246,252,0.98)_0%,rgba(242,246,252,0.92)_36%,rgba(242,246,252,0.50)_68%,rgba(10,22,51,0.10)_100%)]" />
          <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-vk-cobalt">
                Automatizacion, datos y productos digitales
              </p>
              <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] text-vk-navy sm:text-6xl lg:text-7xl">
                {brand.name}
              </h1>
              <p className="mt-6 text-2xl font-extrabold leading-tight text-vk-navy sm:text-3xl">
                {brand.tagline}
              </p>
              <p className="mt-5 max-w-xl text-lg leading-8 text-vk-ink">{brand.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryLink href="/contacto">Solicitar diagnostico</PrimaryLink>
                <SecondaryLink href="/proyectos">Ver proyectos</SecondaryLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-vk-line bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustSignals.map((signal) => (
              <article key={signal.title}>
                <h2 className="text-sm font-extrabold text-vk-navy">{signal.title}</h2>
                <p className="mt-1 text-sm leading-6 text-vk-muted">{signal.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
          <SectionIntro
            eyebrow="Problemas reconocibles"
            title="La tecnologia entra cuando el proceso ya fue entendido."
            copy="VEKTRIUM no parte de una herramienta favorita, sino del trabajo real que hoy consume tiempo, control y energia."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {problems.map((problem) => (
              <article key={problem.title} className="border border-vk-line bg-white p-5">
                <h3 className="font-display text-xl font-extrabold text-vk-navy">{problem.title}</h3>
                <p className="mt-3 text-sm leading-7 text-vk-muted">{problem.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-vk-navy py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-aqua">
                  Servicios
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
                  Soluciones para operar mejor, no solo para verse mejor.
                </h2>
              </div>
              <Link className="text-sm font-extrabold text-vk-aqua hover:text-white" href="/servicios">
                Ver servicios
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <article key={service.slug} className="border border-white/15 bg-white/8 p-5">
                  <h3 className="font-display text-xl font-extrabold">{service.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#DCE7FF]">{service.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <SectionIntro
              eyebrow="Metodo V.E.K.T.O.R."
              title="Un recorrido simple para construir con control."
              copy="Cada fase produce una evidencia concreta para evitar promesas vagas y entregas sin adopcion."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {methodSteps.map((step) => (
                <article key={step.letter} className="border border-vk-line bg-white p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-vk-lime text-sm font-black text-vk-navy">
                    {step.letter}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-vk-navy">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-vk-muted">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <SectionIntro
                eyebrow="Proyectos"
                title="Casos, demos y prototipos con etiquetas claras."
                copy="Los datos ficticios se marcan como ilustrativos. Los casos reales solo se publican con autorizacion."
              />
              <SecondaryLink href="/proyectos">Ver catalogo</SecondaryLink>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Paquetes"
              title="Empezar chico, escalar con evidencia."
              copy="Start, Scale y Partner ordenan el alcance sin inventar precios o resultados antes del diagnostico."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {packages.map((pack) => (
                <article key={pack.name} className="border border-vk-line bg-white p-5">
                  <h3 className="font-display text-2xl font-extrabold text-vk-navy">{pack.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-vk-muted">{pack.fit}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="border border-vk-line bg-white p-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">
              Fundadores
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-vk-navy">
              Finanzas y operaciones en la misma mesa.
            </h2>
            <div className="mt-6 grid gap-4">
              {founders.map((founder) => (
                <article key={founder.name} className="border-t border-vk-line pt-4">
                  <h3 className="font-extrabold text-vk-navy">{founder.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-vk-muted">{founder.focus}</p>
                </article>
              ))}
            </div>
            <Link className="mt-6 inline-flex text-sm font-extrabold text-vk-cobalt" href="/fundadores">
              Conocer fundadores
            </Link>
          </aside>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
