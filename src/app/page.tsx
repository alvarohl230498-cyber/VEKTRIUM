import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  brand,
  firstReportOffer,
  founders,
  methodSteps,
  packages,
  services,
  trustSignals,
} from '@/site/content'

const featuredProjects = [
  {
    title: 'Analitica de RR. HH. conectada a BUK',
    eyebrow: 'API BUK + People Analytics',
    copy:
      'Informacion operativa de BUK organizada en dashboards para revisar dotacion, demografia y rotacion.',
    image: '/projects/01-buk-analytics-demografia.jpeg',
    tags: ['API BUK', 'People Analytics', 'Power BI'],
  },
  {
    title: 'Sistema integral de planillas y remuneraciones',
    eyebrow: 'Payroll Tech para Peru',
    copy:
      'Flujo para ordenar trabajadores, novedades, calculo de planilla y salidas operativas como boletas, PLAME y AFPNet.',
    image: '/projects/03-sistema-remuneraciones.jpeg',
    tags: ['Planillas', 'PLAME', 'AFPNet'],
  },
  {
    title: 'ReportFlow: reportes financieros automaticos',
    eyebrow: 'Automatizacion financiera',
    copy:
      'Descarga, consolidacion y preparacion de reportes para multiples entidades y periodos, con trazabilidad del proceso.',
    image: '/projects/05-reportflow.jpeg',
    tags: ['Reportes', 'Excel', 'Finanzas'],
  },
  {
    title: 'GlobalMatch: conciliacion intercompanias',
    eyebrow: 'Analitica financiera',
    copy:
      'Cruce de transacciones entre entidades para identificar diferencias, pares descuadrados y excepciones prioritarias.',
    image: '/projects/07-globalmatch.jpeg',
    tags: ['Conciliacion', 'Power BI', 'Finanzas'],
  },
] as const

const focusAreas = services.slice(0, 5)

const contactOptions = [
  {
    title: 'Agenda gratuita',
    copy: 'Reserva la primera conversacion para revisar si tu proceso calza con un primer reporte.',
    href: '/agenda',
  },
  {
    title: 'Formulario de contexto',
    copy: 'Cuentanos el area, el reporte o la tarea repetitiva que hoy consume tiempo.',
    href: '/contacto#formulario',
  },
  {
    title: 'WhatsApp empresarial',
    copy: 'Canal en preparacion; mientras se confirma el numero oficial, coordinamos por agenda o formulario.',
    href: '/contacto#whatsapp',
  },
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <section className="relative isolate overflow-hidden border-b border-vk-line bg-vk-ice">
        <Image
          src="/hero-vektrium.png"
          alt="Panel visual con tableros y flujos de automatizacion de VEKTRIUM"
          fill
          priority
          className="object-cover object-center opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(242,246,252,0.98)_0%,rgba(242,246,252,0.94)_42%,rgba(242,246,252,0.72)_72%,rgba(242,246,252,0.86)_100%)]" />

        <LandingNav />

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)] lg:items-center lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-cobalt">
              Automatizacion, datos y productos digitales
            </p>
            <h1 className="mt-5 font-display text-5xl font-black leading-[0.98] text-vk-navy sm:text-6xl lg:text-7xl">
              Menos trabajo manual. Mas reportes claros. Mejor control operativo.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-vk-ink">
              {brand.description} El primer paso es acotado: revisamos el proceso, definimos el
              reporte inicial y pagas cuando presentamos el resultado terminado.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                'Consulta inicial gratuita',
                'Alcance sin costo',
                'Pago al presentar',
              ].map((item) => (
                <div key={item} className="border border-vk-line bg-white/90 px-4 py-3 shadow-vk">
                  <p className="text-sm font-black leading-6 text-vk-navy">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <PrimaryCta href="/agenda">Agendar primer reporte</PrimaryCta>
              <SecondaryCta href="/proyectos">Ver proyectos y demos</SecondaryCta>
            </div>
          </div>

          <HeroEvidencePanel />
        </div>
      </section>

      <section id="servicios" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
            <SectionHeading
              eyebrow="Que construimos"
              title="Soluciones conectadas al proceso, no piezas sueltas."
              copy="La pagina publica muestra el tipo de trabajo que VEKTRIUM ya viene ordenando: automatizacion, reporting, dashboards, portales internos y AI responsable."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {focusAreas.map((service) => (
                <article key={service.slug} className="border border-vk-line bg-vk-ice p-5">
                  <h2 className="font-display text-xl font-black text-vk-navy">{service.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-vk-muted">{service.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="como-trabajamos" className="border-y border-vk-line bg-vk-ice py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.55fr)] lg:items-start">
            <SectionHeading
              eyebrow={firstReportOffer.eyebrow}
              title={firstReportOffer.headline}
              copy={firstReportOffer.detail}
            />
            <aside className="border border-vk-line bg-white p-5 shadow-vk">
              <h2 className="font-display text-2xl font-black text-vk-navy">Ruta del primer reporte</h2>
              <div className="mt-5 grid gap-3">
                {firstReportOffer.steps.map((step, index) => (
                  <div key={step} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-t border-vk-line pt-3 first:border-t-0 first:pt-0">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-vk-cobalt text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold leading-7 text-vk-ink">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs font-semibold leading-6 text-vk-muted">
                {firstReportOffer.note}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section id="proyectos" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Proyectos del portafolio"
              title="Lo que mostramos nace de proyectos y demos ya registrados."
              copy="Los textos se basan en el carrusel de proyectos: BUK, planillas, ReportFlow, DocLink QR, GlobalMatch y otros casos preparados para revisar con imagen y alcance."
            />
            <SecondaryCta href="/proyectos">Abrir carrusel completo</SecondaryCta>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-vk-line bg-vk-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">
                Metodo V.E.K.T.O.R.
              </p>
              <h2 className="mt-3 font-display text-3xl font-black leading-tight text-white sm:text-4xl">
                Se avanza por evidencia, responsables y decisiones.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#DCE7FF]">
                El metodo actual del sitio ordena el trabajo en seis fases: ver, establecer,
                construir, transformar, operar y revisar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {methodSteps.map((step) => (
                <article key={step.letter} className="border border-white/15 bg-white/8 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-vk-lime text-sm font-black text-vk-navy">
                    {step.letter}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#DCE7FF]">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <SectionHeading
                eyebrow="Criterios para clientes"
                title="Lo importante no es prometer mas, sino dejar claro como se trabaja."
                copy="Estos puntos ya aparecen en la estructura publica del sitio y ayudan a explicar por que VEKTRIUM no empieza por una herramienta aislada."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {trustSignals.map((signal) => (
                  <article key={signal.title} className="border border-vk-line bg-vk-ice p-5">
                    <h3 className="font-display text-xl font-black text-vk-navy">{signal.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-vk-muted">{signal.copy}</p>
                  </article>
                ))}
              </div>
            </div>
            <aside className="border border-vk-line bg-vk-ice p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-cobalt">
                Paquetes
              </p>
              <h2 className="mt-3 font-display text-2xl font-black text-vk-navy">
                Start, Scale y Partner
              </h2>
              <div className="mt-5 grid gap-4">
                {packages.map((pack) => (
                  <div key={pack.name} className="border-t border-vk-line pt-4 first:border-t-0 first:pt-0">
                    <h3 className="font-black text-vk-navy">{pack.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-vk-muted">{pack.fit}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-vk-navy py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">
              Siguiente paso
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-white sm:text-5xl">
              Si tienes un reporte o proceso trabado, empecemos por un alcance claro.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#DCE7FF]">
              Finanzas, estrategia, operaciones y producto se revisan juntos para decidir si
              conviene construir un primer reporte, una automatizacion o un portal interno.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-md bg-white px-5 py-3 text-sm font-black text-vk-navy transition hover:bg-vk-lime"
                href="/agenda"
              >
                Agendar primer reporte
              </Link>
              <Link
                className="inline-flex rounded-md border border-white/25 px-5 py-3 text-sm font-black text-white transition hover:border-vk-aqua hover:text-vk-aqua"
                href="/contacto"
              >
                Enviar contexto
              </Link>
            </div>
          </div>

          <aside className="border border-white/15 bg-white/8 p-6">
            <h2 className="font-display text-2xl font-black text-white">Canales actuales</h2>
            <div className="mt-5 grid gap-3">
              {contactOptions.map((option) => (
                <Link
                  key={option.title}
                  className="block rounded-md border border-white/12 bg-vk-navy-2/70 p-4 transition hover:border-vk-aqua"
                  href={option.href}
                >
                  <span className="block text-sm font-black text-vk-aqua">{option.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-[#DCE7FF]">{option.copy}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-white/15 pt-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-vk-aqua">
                Fundadores
              </p>
              <p className="mt-3 text-sm leading-7 text-[#DCE7FF]">
                {founders.map((founder) => founder.name).join(' y ')} trabajan la lectura comercial,
                financiera, operativa y de producto de cada alcance.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

function LandingNav() {
  return (
    <header className="relative z-20 border-b border-vk-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio VEKTRIUM">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-vk-navy font-display text-lg font-black text-vk-lime">
            V
          </span>
          <span className="font-display text-xl font-black text-vk-navy">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-extrabold text-vk-muted lg:flex">
          <Link className="transition hover:text-vk-cobalt" href="#servicios">
            Servicios
          </Link>
          <Link className="transition hover:text-vk-cobalt" href="#como-trabajamos">
            Primer reporte
          </Link>
          <Link className="transition hover:text-vk-cobalt" href="#proyectos">
            Proyectos
          </Link>
          <Link className="transition hover:text-vk-cobalt" href="#contacto">
            Contacto
          </Link>
        </nav>
        <Link
          className="rounded-md bg-vk-cobalt px-4 py-2 text-sm font-black text-white transition hover:bg-vk-navy focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
          href="/agenda"
        >
          Agenda gratis
        </Link>
      </div>
    </header>
  )
}

function HeroEvidencePanel() {
  return (
    <aside className="border border-vk-line bg-white/90 p-5 shadow-vk backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-vk-cobalt">
        Lectura inicial
      </p>
      <h2 className="mt-3 font-display text-3xl font-black leading-tight text-vk-navy">
        Proceso, datos y entregable antes de escalar.
      </h2>
      <p className="mt-4 text-sm leading-7 text-vk-muted">
        El primer reporte sirve para ordenar el problema y probar si la solucion tiene sentido antes
        de pasar a una implementacion mas grande.
      </p>
      <div className="mt-6 grid gap-3">
        {[
          ['Proceso', 'Donde nace la friccion y quien la ejecuta.'],
          ['Datos', 'Que fuentes existen, que calidad tienen y quien responde por ellas.'],
          ['Entregable', 'Que reporte, tablero o automatizacion inicial se puede presentar.'],
        ].map(([title, copy]) => (
          <div key={title} className="border-t border-vk-line pt-3 first:border-t-0 first:pt-0">
            <p className="font-black text-vk-navy">{title}</p>
            <p className="mt-1 text-sm leading-6 text-vk-muted">{copy}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md bg-vk-navy px-4 py-3">
        <p className="text-sm font-black text-white">{firstReportOffer.eyebrow}</p>
        <p className="mt-1 text-xs leading-5 text-[#DCE7FF]">{firstReportOffer.note}</p>
      </div>
    </aside>
  )
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-cobalt">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-black leading-tight text-vk-navy sm:text-4xl">
        {title}
      </h2>
      {copy ? <p className="mt-4 text-base leading-8 text-vk-muted">{copy}</p> : null}
    </div>
  )
}

function ProjectCard({
  title,
  eyebrow,
  copy,
  image,
  tags,
}: {
  title: string
  eyebrow: string
  copy: string
  image: string
  tags: readonly string[]
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-vk-line bg-vk-ice">
      <div className="relative aspect-[16/10] border-b border-vk-line bg-white">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-2"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-vk-cobalt">{eyebrow}</p>
        <h3 className="mt-3 font-display text-xl font-black leading-tight text-vk-navy">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-vk-muted">{copy}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs font-bold text-vk-navy">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function PrimaryCta({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md bg-vk-cobalt px-5 py-3 text-sm font-black text-white shadow-vk transition hover:bg-vk-navy focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
      href={href}
    >
      {children}
    </Link>
  )
}

function SecondaryCta({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md border border-vk-line bg-white px-5 py-3 text-sm font-black text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
      href={href}
    >
      {children}
    </Link>
  )
}
