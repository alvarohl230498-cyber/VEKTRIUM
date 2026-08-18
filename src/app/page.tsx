import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Compass,
  Headphones,
  Send,
  ShieldCheck,
  UsersRound,
  Workflow,
  Zap,
} from 'lucide-react'

import { AutomationNetwork } from '@/components/site/automation-network'
import { AutomationPreviewPanel } from '@/components/site/automation-preview-panel'
import { ProcessFlow, type ProcessStep } from '@/components/site/process-flow'
import { Reveal, Stagger, StaggerItem } from '@/components/site/reveal'
import { firstReportOffer, founders } from '@/site/content'
import { submitContactRequest } from './contacto/actions'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const ERROR_MESSAGES: Record<string, string> = {
  invalido: 'Revisa el formulario: falta completar algun campo.',
  envio: 'No se pudo enviar la solicitud. Intenta nuevamente en unos minutos.',
}

const featuredProjects = [
  {
    title: 'Analitica de RR. HH. conectada a BUK',
    category: 'People Analytics',
    image: '/projects/01-buk-analytics-demografia.jpeg',
    description:
      'Dashboard ejecutivo y operativo para convertir datos de BUK en lectura accionable.',
    tags: ['API BUK', 'Power BI', 'RR. HH.'],
  },
  {
    title: 'Sistema integral de planillas y remuneraciones',
    category: 'Operacion interna',
    image: '/projects/03-sistema-remuneraciones.jpeg',
    description:
      'Estructura de control para calculo, validacion y seguimiento de remuneraciones.',
    tags: ['Planillas', 'Control', 'RR. HH.'],
  },
  {
    title: 'ReportFlow: reportes financieros automaticos',
    category: 'Finanzas',
    image: '/projects/05-reportflow.jpeg',
    description:
      'Flujo para transformar archivos operativos en reportes financieros listos para decision.',
    tags: ['Reportes', 'Finanzas', 'Automatizacion'],
  },
  {
    title: 'GlobalMatch: conciliacion intercompanias',
    category: 'Conciliacion',
    image: '/projects/07-globalmatch.jpeg',
    description:
      'Propuesta para cruzar operaciones entre companias y detectar diferencias pendientes.',
    tags: ['Conciliacion', 'Control', 'Datos'],
  },
] as const

const heroBadges = [
  {
    eyebrow: 'Primera consultoria',
    title: 'GRATIS',
    copy: 'Consulta y alcance inicial sin costo.',
    icon: CalendarDays,
  },
  {
    eyebrow: 'Pago al final',
    title: 'cuando presentamos el resultado',
    copy: 'El primer reporte se paga al finalizar el proceso.',
    icon: ShieldCheck,
  },
] as const

const automationSteps: ProcessStep[] = [
  {
    title: 'Entendemos tu negocio',
    copy:
      'Revisamos tu proceso, tus archivos y el resultado que necesitas conseguir.',
    icon: 'message',
  },
  {
    title: 'Disenamos tu solucion',
    copy:
      'Definimos el reporte, dashboard o automatizacion con el alcance correcto.',
    icon: 'puzzle',
  },
  {
    title: 'Implementamos y presentamos',
    copy:
      'Construimos el entregable acordado, lo revisamos contigo y dejamos claro el siguiente paso.',
    icon: 'rocket',
  },
]

const differentiators = [
  {
    title: 'A medida',
    copy: 'Partimos del proceso real, no de una plantilla generica.',
    icon: Compass,
  },
  {
    title: 'Rapido y concreto',
    copy: 'Priorizamos un primer entregable que se pueda revisar.',
    icon: Zap,
  },
  {
    title: 'Sin adelanto inicial',
    copy: 'Consulta y alcance gratuitos para el primer reporte.',
    icon: ShieldCheck,
  },
  {
    title: 'Base escalable',
    copy: 'Si funciona, queda listo para crecer con mas automatizaciones.',
    icon: Workflow,
  },
  {
    title: 'Acompanamiento real',
    copy: 'Trabajamos contigo antes, durante y despues del entregable.',
    icon: Headphones,
  },
] as const

const formAreas = ['Finanzas', 'Recursos Humanos', 'Operaciones', 'Comercial', 'Direccion']

export default async function Home({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : {}
  const rawError = params.error
  const errorCode = Array.isArray(rawError) ? rawError[0] : rawError
  const errorMessage: string | null = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.envio ?? 'No se pudo enviar la solicitud.')
    : null
  const rawEnviado = params.enviado
  const enviado = (Array.isArray(rawEnviado) ? rawEnviado[0] : rawEnviado) === '1'

  return (
    <main className="public-site overflow-hidden bg-white text-vk-navy">
      <section className="relative isolate overflow-hidden bg-vk-navy text-white">
        <ImpactBackdrop />
        <LandingNav />

        <div className="relative mx-auto grid min-h-[640px] max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:min-h-[720px] lg:grid-cols-[minmax(0,0.95fr)_minmax(430px,0.85fr)] lg:items-center lg:px-8 lg:pb-20 lg:pt-14">
          <Reveal className="max-w-3xl">
            <h1 className="text-balance text-4xl font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
              Automatizamos tu empresa para que{' '}
              <span className="text-vk-lime">vendas mas</span> y trabajes
              menos.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              Creamos sistemas, dashboards e inteligencia artificial para reducir
              procesos manuales y convertir datos en entregables claros.
            </p>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {heroBadges.map((badge) => (
                <article
                  key={badge.title}
                  className="group border border-white/18 bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-300 hover:border-vk-aqua/60 hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center border border-vk-lime/55 bg-vk-lime/10 text-vk-lime">
                      <badge.icon className="size-6" />
                    </span>
                    <span>
                      <span className="block text-sm text-white/74">
                        {badge.eyebrow}
                      </span>
                      <span className="mt-1 block text-xl font-black leading-tight text-vk-lime">
                        {badge.title}
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/64">
                    {badge.copy}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DarkPrimaryCta href="#agenda">
                <CalendarDays className="size-5" />
                Agendar consulta gratuita
                <ArrowRight className="size-5" />
              </DarkPrimaryCta>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-white/68">
              <div className="flex -space-x-2">
                {founders.map((founder) => (
                  <span
                    key={founder.name}
                    className="grid size-10 place-items-center border border-white/16 bg-white/10 text-xs font-black text-white shadow-lg"
                  >
                    {getInitials(founder.name)}
                  </span>
                ))}
              </div>
              <p>{firstReportOffer.note}</p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="hidden lg:block">
            <AutomationPreviewPanel
              title="Dashboard operativo"
              subtitle="Panel preparado para conectar datos reales"
            />
          </Reveal>
        </div>
      </section>

      <section id="como-trabajamos" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-vk-cobalt">
            Como trabajamos
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-vk-navy sm:text-4xl">
            Un proceso simple, resultados reales
          </h2>
        </Reveal>

        <div className="mx-auto mt-14 max-w-6xl">
          <ProcessFlow
            steps={automationSteps}
            note="Pagas unicamente cuando el primer reporte queda terminado y presentado."
          />
        </div>
      </section>

      <section id="proyectos" className="bg-vk-ice px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-vk-cobalt">
            Proyectos destacados
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-normal text-vk-navy sm:text-4xl">
            Soluciones que generan impacto
          </h2>
          <p className="mt-4 text-base leading-8 text-vk-muted">
            Muestras del portafolio actual. No usamos metricas inventadas: cada
            tarjeta describe el tipo de solucion y el contexto trabajado.
          </p>
        </Reveal>

        <Stagger className="mx-auto mt-12 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProjects.map((project) => (
            <StaggerItem key={project.title}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10 flex justify-center">
          <DarkSecondaryCta href="#agenda">
            Quiero un reporte similar
            <ArrowRight className="size-4" />
          </DarkSecondaryCta>
        </Reveal>
      </section>

      <section className="border-y border-vk-mint/55 bg-gradient-to-r from-vk-lime/10 via-white to-vk-aqua/10 px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-7xl">
          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-vk-cobalt">
            Por que elegir VEKTRIUM?
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {differentiators.map((item) => (
              <article key={item.title} className="text-center">
                <item.icon className="mx-auto size-10 text-vk-aqua" />
                <h3 className="mt-4 text-base font-black text-vk-navy">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-44 text-sm leading-6 text-vk-slate">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section
        id="agenda"
        className="relative overflow-hidden bg-vk-navy px-4 py-20 text-white sm:px-6 lg:px-8"
      >
        <ImpactBackdrop compact />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(430px,0.72fr)] lg:items-start">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-vk-aqua">
              Agenda con nosotros
            </p>
            <h2 className="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl">
              Consulta gratuita, alcance claro y pago al{' '}
              <span className="text-vk-lime">presentar el resultado</span>.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              Cuentanos el reporte o proceso que hoy te consume tiempo. Si el
              alcance inicial tiene sentido, lo trabajamos sin adelanto y te
              presentamos el primer resultado terminado.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {firstReportOffer.steps.slice(0, 3).map((step, index) => (
                <article
                  key={step}
                  className="border border-white/12 bg-white/[0.045] p-4"
                >
                  <p className="text-sm font-black text-vk-lime">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/74">
                    {step}
                  </p>
                </article>
              ))}
            </div>

            <div id="equipo" className="mt-8 border border-white/12 bg-white/[0.045] p-5">
              <div className="flex items-center gap-3">
                <UsersRound className="size-6 text-vk-aqua" />
                <h3 className="text-lg font-black text-white">Equipo fundador</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {founders.map((founder) => (
                  <a
                    key={founder.name}
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-white/10 bg-vk-navy-2/60 p-4 transition hover:border-vk-aqua/50 hover:bg-white/8"
                  >
                    <p className="text-sm font-black text-white">
                      {founder.name}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/58">
                      {founder.focus}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-vk-aqua">
                      Ver LinkedIn
                      <ArrowRight className="size-3 transition group-hover:translate-x-1" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <AgendaForm errorMessage={errorMessage} enviado={enviado} />
          </Reveal>
        </div>
      </section>
    </main>
  )
}

function AgendaForm({
  enviado,
  errorMessage,
}: {
  enviado: boolean
  errorMessage: string | null
}) {
  if (enviado) {
    return (
      <aside className="border border-vk-lime/35 bg-white p-6 text-vk-navy shadow-[0_28px_90px_rgba(63,240,128,0.16)]">
        <CheckCircle2 className="size-10 text-vk-success" />
        <h3 className="mt-5 text-2xl font-black">Solicitud recibida</h3>
        <p className="mt-3 text-sm leading-7 text-vk-muted">
          Recibimos tu caso. El siguiente paso es revisar el proceso y coordinar
          la consulta gratuita para definir el alcance inicial.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center bg-vk-navy px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-vk-cobalt"
        >
          Volver al inicio
        </Link>
      </aside>
    )
  }

  return (
    <form
      action={submitContactRequest}
      className="border border-white/12 bg-white p-5 text-vk-navy shadow-[0_30px_100px_rgba(0,0,0,0.32)] sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center bg-vk-lime text-vk-navy">
          <ClipboardList className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-vk-cobalt">
            Primer reporte
          </p>
          <h3 className="text-2xl font-black">Cuentanos tu caso</h3>
        </div>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-5 border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        <FormField label="Nombre">
          <input
            className="mt-2 w-full border border-vk-line px-3 py-3 text-sm outline-none transition focus:border-vk-cobalt"
            name="nombre"
            required
          />
        </FormField>

        <FormField label="Correo o telefono">
          <input
            className="mt-2 w-full border border-vk-line px-3 py-3 text-sm outline-none transition focus:border-vk-cobalt"
            name="contacto"
            required
          />
        </FormField>

        <FormField label="Area">
          <select
            className="mt-2 w-full border border-vk-line px-3 py-3 text-sm outline-none transition focus:border-vk-cobalt"
            name="area"
            required
          >
            <option value="">Seleccionar</option>
            {formAreas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Que reporte o proceso quieres mejorar?">
          <textarea
            className="mt-2 min-h-32 w-full border border-vk-line px-3 py-3 text-sm outline-none transition focus:border-vk-cobalt"
            name="necesidad"
            required
          />
        </FormField>
      </div>

      <button
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 bg-vk-cobalt px-5 text-sm font-black uppercase tracking-normal text-white transition hover:-translate-y-0.5 hover:bg-vk-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vk-cobalt"
        type="submit"
      >
        Enviar solicitud
        <Send className="size-4" />
      </button>
      <p className="mt-4 text-xs leading-5 text-vk-muted">
        Usaremos estos datos solo para responder tu solicitud, coordinar la
        consulta gratuita y definir el alcance inicial.
      </p>
    </form>
  )
}

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-vk-navy">{label}</span>
      {children}
    </label>
  )
}

function LandingNav() {
  const links = [
    { href: '#proyectos', label: 'Proyectos' },
    { href: '#como-trabajamos', label: 'Como trabajamos' },
    { href: '#agenda', label: 'Agenda' },
  ]

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-3" aria-label="VEKTRIUM">
        <span className="grid size-10 place-items-center bg-vk-lime text-vk-navy">
          <span className="text-xl font-black">V</span>
        </span>
        <span className="text-xl font-black tracking-normal text-white">
          VEKTRIUM
        </span>
      </Link>
      <nav className="hidden items-center gap-9 text-sm font-bold text-white/76 lg:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-vk-lime">
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="#agenda"
        className="inline-flex h-12 items-center justify-center bg-vk-lime px-6 text-sm font-black text-vk-navy shadow-[0_16px_38px_rgba(63,240,128,0.24)] transition hover:-translate-y-0.5 hover:bg-vk-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vk-aqua"
      >
        Agendar consulta
      </Link>
    </header>
  )
}

function ProjectCard({ project }: { project: (typeof featuredProjects)[number] }) {
  return (
    <article className="group h-full overflow-hidden border border-vk-border bg-white shadow-[0_18px_42px_rgba(10,20,44,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(10,20,44,0.14)]">
      <div className="relative aspect-[1.75] overflow-hidden bg-vk-navy">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-vk-cobalt">
          {project.category}
        </p>
        <h3 className="mt-2 min-h-14 text-lg font-black leading-7 text-vk-navy">
          {project.title}
        </h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-vk-slate">
          {project.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="border border-vk-border bg-vk-ice px-2.5 py-1 text-xs font-bold text-vk-slate"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function DarkPrimaryCta({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-14 items-center justify-center gap-3 bg-vk-lime px-6 text-sm font-black uppercase tracking-normal text-vk-navy shadow-[0_18px_44px_rgba(63,240,128,0.28)] transition hover:-translate-y-0.5 hover:bg-vk-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vk-aqua"
    >
      {children}
    </Link>
  )
}

function DarkSecondaryCta({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 border border-vk-cobalt/40 bg-white px-6 text-sm font-black text-vk-navy transition hover:-translate-y-0.5 hover:border-vk-cobalt hover:text-vk-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vk-cobalt"
    >
      {children}
    </Link>
  )
}

function ImpactBackdrop({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-50">
        <AutomationNetwork density={compact ? 14 : 28} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,8,23,0.98)_0%,rgba(4,12,30,0.88)_48%,rgba(4,18,36,0.92)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(31,216,169,0.22),transparent_36%),radial-gradient(circle_at_42%_72%,rgba(25,107,255,0.14),transparent_30%)]" />
      <div className="absolute right-[-12%] top-[13%] h-72 w-[58rem] rotate-[-14deg] border border-vk-aqua/18" />
      {!compact ? (
        <div className="absolute right-[-18%] top-[34%] h-72 w-[64rem] rotate-[-21deg] border border-vk-lime/13" />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
