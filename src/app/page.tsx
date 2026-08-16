import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Compass, Headphones, ShieldCheck, Workflow, Zap } from 'lucide-react'
import { AutomationNetwork } from '@/components/site/automation-network'
import { AutomationPreviewPanel } from '@/components/site/automation-preview-panel'
import { ProcessFlow, type ProcessStep } from '@/components/site/process-flow'
import { Reveal, Stagger, StaggerItem } from '@/components/site/reveal'
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

const heroBadges = [
  'Consulta inicial gratuita',
  'Alcance sin costo',
  'Pago al presentar el reporte',
] as const

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

const focusAreas = services.slice(0, 5)

const automationSteps = [
  {
    title: 'Entendemos tu proceso',
    copy: 'Nos cuentas el proceso, el reporte que necesitas y donde hoy se pierde tiempo.',
    icon: 'message',
  },
  {
    title: 'Definimos el alcance',
    copy: 'Aterrizamos datos necesarios, responsables y entregable inicial sin costo.',
    icon: 'puzzle',
  },
  {
    title: 'Construimos y presentamos',
    copy: 'Trabajamos el primer reporte acordado y el pago llega cuando se presenta terminado.',
    icon: 'rocket',
  },
] satisfies ProcessStep[]

const differentiators = [
  {
    title: 'Soluciones a medida',
    copy: 'Partimos del proceso real, no de una plantilla generica.',
    icon: Compass,
  },
  {
    title: 'Implementacion con evidencia',
    copy: 'Cada avance deja alcance, supuestos y entregable visible.',
    icon: Zap,
  },
  {
    title: 'Sin adelanto inicial',
    copy: 'Primer reporte con consulta y alcance gratuitos.',
    icon: ShieldCheck,
  },
  {
    title: 'Tecnologia trazable',
    copy: 'Datos, permisos y responsables quedan documentados.',
    icon: Workflow,
  },
  {
    title: 'Acompanamiento real',
    copy: 'Fundadores involucrados antes, durante y despues.',
    icon: Headphones,
  },
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <section className="relative isolate overflow-hidden bg-vk-navy text-white">
        <ImpactBackdrop />
        <LandingNav />

        <div className="relative mx-auto grid min-h-[780px] max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(430px,0.78fr)] lg:items-center lg:px-8 lg:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">
              Automatizacion, datos y productos digitales
            </p>
            <h1 className="mt-5 font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl lg:text-7xl">
              Menos trabajo manual.{' '}
              <span className="text-vk-lime">Mas reportes claros.</span> Mejor control operativo.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#DCE7FF] sm:text-lg">
              {brand.description} Empezamos por un primer reporte acotado para revisar proceso,
              datos, responsables y entregable antes de escalar.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {heroBadges.map((item) => (
                <div key={item} className="border border-white/15 bg-white/8 px-4 py-3">
                  <p className="text-sm font-black leading-6 text-white">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <DarkPrimaryCta href="/agenda">Agendar primer reporte</DarkPrimaryCta>
              <DarkSecondaryCta href="/proyectos">Ver proyectos y demos</DarkSecondaryCta>
            </div>

            <p className="mt-6 max-w-2xl text-xs font-semibold leading-6 text-[#BFD0F4]">
              {firstReportOffer.note}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <AutomationPreviewPanel title="Panel operativo VEKTRIUM" subtitle="Vista preparada para datos reales" />
          </Reveal>
        </div>
      </section>

      <section id="como-trabajamos" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-cobalt">
              Como trabajamos
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-vk-navy">
              Un proceso simple, con evidencia antes de escalar.
            </h2>
            <p className="mt-4 text-base leading-8 text-vk-muted">
              {firstReportOffer.detail}
            </p>
          </Reveal>

          <ProcessFlow
            steps={automationSteps}
            note="Pagas al finalizar, cuando el primer reporte acordado se presenta terminado."
          />
        </div>
      </section>

      <section id="proyectos" className="border-y border-vk-line bg-vk-ice py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Proyectos del portafolio"
              title="Casos y demos con nombres, imagenes y alcance ya registrados."
              copy="Esta seccion resume piezas del carrusel actual: BUK, planillas, ReportFlow y GlobalMatch. El carrusel completo mantiene mas detalle de capacidades, tecnologias e imagenes."
            />
            <SecondaryCta href="/proyectos">Abrir carrusel completo</SecondaryCta>
          </Reveal>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.map((project) => (
              <StaggerItem key={project.title}>
                <ProjectCard {...project} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="servicios" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Que construimos"
              title="Tecnologia aplicada a procesos que ya entendimos bien."
              copy="VEKTRIUM no parte de una herramienta favorita. El trabajo se ordena por proceso, datos disponibles, usuarios, permisos, trazabilidad y decision."
            />
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {focusAreas.map((service) => (
              <StaggerItem key={service.slug}>
                <article className="border border-vk-line bg-vk-ice p-5">
                  <h2 className="font-display text-xl font-black text-vk-navy">{service.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-vk-muted">{service.summary}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-vk-navy py-20 text-white">
        <ImpactBackdrop />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">
              Metodo V.E.K.T.O.R.
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-white">
              Se avanza por evidencia, no por promesas sueltas.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#DCE7FF]">
              El metodo del sitio ordena el trabajo en seis fases: ver, establecer, construir,
              transformar, operar y revisar.
            </p>
          </Reveal>
          <Stagger className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {methodSteps.map((step) => (
              <StaggerItem key={step.letter}>
                <article className="border border-white/15 bg-white/8 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-vk-lime text-sm font-black text-vk-navy">
                    {step.letter}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#DCE7FF]">{step.copy}</p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-gradient-to-r from-white via-vk-ice to-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-black uppercase tracking-[0.16em] text-vk-cobalt">
            Por que elegir VEKTRIUM
          </p>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {differentiators.map((item) => {
              const Icon = item.icon

              return (
                <StaggerItem key={item.title}>
                  <article className="h-full text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white text-vk-cobalt shadow-[0_14px_34px_rgba(10,22,51,0.10)]">
                      <Icon aria-hidden="true" size={24} strokeWidth={2.4} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-black text-vk-navy">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-vk-muted">{item.copy}</p>
                  </article>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Criterios para clientes"
              title="La propuesta se sostiene en control, trazabilidad y transferencia."
              copy="Estos puntos ya forman parte del sitio publico y explican como se trabaja antes de convertir un alcance inicial en una implementacion mayor."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {trustSignals.map((signal) => (
                <article key={signal.title} className="border border-vk-line bg-vk-ice p-5">
                  <h3 className="font-display text-xl font-black text-vk-navy">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-vk-muted">{signal.copy}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="border border-vk-line bg-vk-ice p-6">
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
          </Reveal>
        </div>
      </section>

      <section id="contacto" className="relative isolate overflow-hidden bg-vk-navy py-20 text-white">
        <ImpactBackdrop />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:px-8">
          <Reveal>
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
          </Reveal>

          <Reveal delay={0.1} className="border border-white/15 bg-white/8 p-6">
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
          </Reveal>
        </div>
      </section>
    </main>
  )
}

function LandingNav() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-vk-navy/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio VEKTRIUM">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-vk-lime font-display text-lg font-black text-vk-navy">
            V
          </span>
          <span className="font-display text-xl font-black text-white">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-extrabold text-white/70 lg:flex">
          <Link className="transition hover:text-vk-lime" href="#como-trabajamos">
            Primer reporte
          </Link>
          <Link className="transition hover:text-vk-lime" href="#proyectos">
            Proyectos
          </Link>
          <Link className="transition hover:text-vk-lime" href="#servicios">
            Servicios
          </Link>
          <Link className="transition hover:text-vk-lime" href="#contacto">
            Contacto
          </Link>
        </nav>
        <Link
          className="rounded-md bg-vk-lime px-4 py-2 text-sm font-black text-vk-navy transition hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
          href="/agenda"
        >
          Agenda gratis
        </Link>
      </div>
    </header>
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
    <article className="flex h-full flex-col overflow-hidden border border-vk-line bg-white shadow-vk">
      <div className="relative aspect-[16/10] border-b border-vk-line bg-vk-ice">
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
            <span key={tag} className="rounded-md bg-vk-ice px-2 py-1 text-xs font-bold text-vk-navy">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function DarkPrimaryCta({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md bg-vk-lime px-5 py-3 text-sm font-black text-vk-navy shadow-vk transition hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
      href={href}
    >
      {children}
    </Link>
  )
}

function DarkSecondaryCta({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md border border-white/20 bg-white/8 px-5 py-3 text-sm font-black text-white transition hover:border-vk-aqua hover:text-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-aqua focus:ring-offset-2 focus:ring-offset-vk-navy"
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

function ImpactBackdrop() {
  return (
    <>
      <AutomationNetwork density={24} />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:82px_82px]" />
      <div className="absolute left-0 top-28 h-px w-full bg-gradient-to-r from-transparent via-vk-aqua/50 to-transparent" />
      <div className="absolute bottom-16 left-0 h-px w-full bg-gradient-to-r from-transparent via-vk-cobalt/35 to-transparent" />
      <div className="absolute right-[8%] top-[18%] h-72 w-72 rounded-full border border-vk-aqua/20" />
      <div className="absolute right-[16%] top-[34%] h-96 w-96 rounded-full border border-vk-cobalt/20" />
    </>
  )
}
