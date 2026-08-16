import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { brand } from '@/site/content'

const ctaHref = '/agenda'

const workSteps = [
  {
    number: '01',
    mark: '...',
    title: 'Entendemos tu negocio',
    copy: 'Analizamos tus procesos y detectamos oportunidades de mejora.',
    tone: 'bg-vk-aqua/12 text-vk-aqua',
  },
  {
    number: '02',
    mark: '+',
    title: 'Disenamos tu solucion',
    copy: 'Creamos la estrategia, el sistema o dashboard a medida de tus necesidades.',
    tone: 'bg-vk-cobalt/12 text-vk-cobalt',
  },
  {
    number: '03',
    mark: '>>',
    title: 'Implementamos y escalamos',
    copy: 'Lo implementamos, automatizamos y te acompanamos para que crezcas.',
    tone: 'bg-vk-lime/25 text-vk-navy',
  },
]

const featuredProjects = [
  {
    title: 'Dashboard Financiero',
    copy: 'Informacion en tiempo real para tomar mejores decisiones.',
    image: '/projects/05-reportflow.jpeg',
    tags: ['Power BI', 'Finanzas', 'Dashboard'],
  },
  {
    title: 'Automatizacion de Procesos',
    copy: 'Eliminamos tareas manuales y ahorramos horas de trabajo.',
    image: '/projects/04-automatizacion-buk.jpeg',
    tags: ['Automatizacion', 'Make', 'API'],
  },
  {
    title: 'Plataforma de Reservas',
    copy: 'Sistema web para gestionar reservas, clientes y operaciones.',
    image: '/projects/02-finova-ai.jpeg',
    tags: ['Desarrollo Web', 'SaaS', 'UX/UI'],
  },
  {
    title: 'Agentes de IA',
    copy: 'Asistentes inteligentes que responden y trabajan 24/7 por ti.',
    image: '/projects/06-doclink-qr.jpeg',
    tags: ['IA', 'Chatbot', 'OpenAI'],
  },
]

const benefits = [
  {
    mark: 'O',
    title: 'Soluciones a medida',
    copy: 'Disenamos lo que tu empresa realmente necesita.',
    color: 'text-vk-aqua',
  },
  {
    mark: '!',
    title: 'Implementacion rapida',
    copy: 'Entregamos resultados en semanas, no en meses.',
    color: 'text-vk-cobalt',
  },
  {
    mark: 'V',
    title: 'Sin contratos largos',
    copy: 'Trabajamos por resultados, no por contratos.',
    color: 'text-vk-navy',
  },
  {
    mark: '/\\',
    title: 'Tecnologia que escala',
    copy: 'Soluciones pensadas para crecer contigo.',
    color: 'text-vk-warning',
  },
  {
    mark: '24',
    title: 'Acompanamiento real',
    copy: 'Estamos contigo antes, durante y despues.',
    color: 'text-vk-cobalt',
  },
]

const contactLinks = [
  {
    label: 'WhatsApp',
    value: '+51 987 654 321',
    href: 'https://wa.me/51987654321',
    tone: 'bg-vk-success text-white',
  },
  {
    label: 'Email',
    value: 'hola@vektrium.com',
    href: 'mailto:hola@vektrium.com',
    tone: 'bg-vk-cobalt text-white',
  },
  {
    label: 'LinkedIn',
    value: '/company/vektrium',
    href: 'https://www.linkedin.com/company/vektrium',
    tone: 'bg-vk-navy text-white',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <section className="relative isolate overflow-hidden bg-vk-navy text-white">
        <NetworkBackdrop />
        <LandingNav />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,1fr)] lg:items-center lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Automatizamos tu empresa para que{' '}
              <span className="text-vk-lime">vendas mas</span> y trabajes menos.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
              Creamos sistemas, dashboards e inteligencia artificial que eliminan procesos manuales
              y te dan resultados reales.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              <HeroBadge mark="Cal" title="Primera consultoria" value="GRATIS" />
              <HeroBadge mark="Ok" title="Solo pagas cuando" value="apruebas el resultado" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LandingButton href={ctaHref}>AGENDAR CONSULTA GRATUITA -&gt;</LandingButton>
              <Link
                className="text-sm font-extrabold text-vk-aqua underline-offset-4 transition hover:text-vk-lime hover:underline"
                href="/proyectos"
              >
                Ver proyectos
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex -space-x-3" aria-hidden="true">
                {['JD', 'AH', 'BI', 'AI'].map((initials) => (
                  <span
                    key={initials}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-vk-navy bg-vk-ice text-xs font-black text-vk-navy"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-sm font-black text-vk-lime">5/5 en claridad operativa</p>
                <p className="text-xs leading-5 text-white/66">
                  Empresas que ya revisaron y transformaron su operacion.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[560px]" aria-label="Mockup de dashboard financiero">
            <div className="absolute inset-0 hidden border border-vk-aqua/20 lg:block" />
            <FinancialDashboard />
          </div>
        </div>
      </section>

      <section id="como-trabajamos" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="COMO TRABAJAMOS"
            title="Un proceso simple, resultados reales"
            align="center"
          />
          <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-16 hidden border-t border-dashed border-vk-line lg:block" />
            {workSteps.map((step) => (
              <WorkCard key={step.number} {...step} />
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-xl rounded-md border border-vk-line bg-vk-ice px-5 py-3 text-center text-sm font-bold text-vk-navy">
            Pagas unicamente cuando estas conforme con la{' '}
            <span className="text-vk-success">solucion.</span>
          </div>
        </div>
      </section>

      <section id="proyectos" className="bg-vk-ice py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="PROYECTOS DESTACADOS"
            title="Soluciones que generan impacto"
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.map((project) => (
              <ProjectShowcaseCard key={project.title} {...project} />
            ))}
          </div>
          <div className="mt-9 flex justify-center">
            <Link
              className="inline-flex rounded-md border border-vk-cobalt bg-white px-8 py-3 text-sm font-extrabold text-vk-navy transition hover:bg-vk-cobalt hover:text-white"
              href="/proyectos"
            >
              Ver mas proyectos -&gt;
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-vk-cobalt">
            POR QUE ELEGIR VEKTRIUM
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit) => (
              <BenefitItem key={benefit.title} {...benefit} />
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="relative isolate overflow-hidden bg-vk-navy py-16 text-white">
        <NetworkBackdrop />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.58fr)_minmax(260px,0.42fr)] lg:items-stretch lg:px-8">
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl">
              Listo para <span className="text-vk-lime">transformar</span> tu negocio?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              La primera consultoria es completamente GRATIS. Hablemos de tu proyecto y te
              mostraremos como podemos ayudarte.
            </p>
            <div className="mt-8">
              <LandingButton href={ctaHref}>AGENDAR CONSULTA GRATUITA -&gt;</LandingButton>
            </div>
          </div>

          <div className="rounded-md border border-white/12 bg-white/7 p-5 shadow-vk backdrop-blur">
            <p className="text-sm font-extrabold text-white">O contactanos por:</p>
            <div className="mt-5 grid gap-3">
              {contactLinks.map((item) => (
                <a
                  key={item.label}
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-vk-navy-2/80 p-3 transition hover:border-vk-aqua"
                  href={item.href}
                  rel="noopener noreferrer"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-md text-xs font-black ${item.tone}`}>
                    {item.label.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-white/62">{item.label}</span>
                    <span className="block truncate text-sm font-extrabold text-white">{item.value}</span>
                  </span>
                  <span className="text-vk-aqua" aria-hidden="true">
                    -&gt;
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-md border border-white/12 bg-white/5 p-6">
            <LandingLogo />
            <p className="mt-10 text-xl font-extrabold leading-snug text-white">
              Automatizamos hoy, transformamos tu manana.
            </p>
          </div>
        </div>
        <div className="relative mx-auto mt-12 max-w-7xl border-t border-white/10 px-4 pt-6 text-center text-xs text-white/48 sm:px-6 lg:px-8">
          &copy; 2026 Vektrium. Todos los derechos reservados.
        </div>
      </section>
    </main>
  )
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-vk-navy/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Inicio VEKTRIUM">
          <LandingLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-extrabold text-white/76 md:flex">
          <Link className="transition hover:text-vk-lime" href="#proyectos">
            Proyectos
          </Link>
          <Link className="transition hover:text-vk-lime" href="#como-trabajamos">
            Como trabajamos
          </Link>
          <Link className="transition hover:text-vk-lime" href="#contacto">
            Contacto
          </Link>
        </nav>
        <Link
          className="rounded-md bg-vk-lime px-4 py-2 text-sm font-black text-vk-navy transition hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
          href={ctaHref}
        >
          Agendar consulta
        </Link>
      </div>
    </header>
  )
}

function LandingLogo() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-vk-aqua via-vk-lime to-vk-cobalt font-display text-xl font-black text-vk-navy">
        V
      </span>
      <span className="font-display text-lg font-black tracking-normal text-white">{brand.name}</span>
    </div>
  )
}

function LandingButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex items-center justify-center rounded-md bg-vk-lime px-6 py-4 text-sm font-black text-vk-navy shadow-vk transition hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
      href={href}
    >
      {children}
    </Link>
  )
}

function HeroBadge({ mark, title, value }: { mark: string; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-white/16 bg-white/6 p-4 backdrop-blur">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-vk-aqua/30 text-xs font-black text-vk-lime">
        {mark}
      </span>
      <span>
        <span className="block text-sm font-semibold text-white/82">{title}</span>
        <span className="block text-base font-black text-vk-lime">{value}</span>
      </span>
    </div>
  )
}

function FinancialDashboard() {
  const kpis = [
    ['Ventas', 'S/ 1.234.567', '+12.5% vs anterior'],
    ['Utilidad', 'S/ 234.567', '+8.3% vs anterior'],
    ['Margen', '18.9%', '+2.3% vs anterior'],
  ]
  const processItems = ['Facturacion', 'Reportes', 'Notificaciones', 'Backup']

  return (
    <div className="relative z-10 mx-auto max-w-2xl rounded-md border border-white/12 bg-vk-navy-2/95 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] backdrop-blur lg:absolute lg:right-0 lg:top-12">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-sm font-black text-white">Dashboard Financiero</h2>
        <span className="text-xs font-black text-vk-aqua">[]</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {kpis.map(([label, value, delta]) => (
          <article key={label} className="rounded-md border border-white/8 bg-white/6 p-4">
            <p className="text-xs font-bold text-white/52">{label}</p>
            <p className="mt-2 text-xl font-black text-white">{value}</p>
            <p className="mt-1 text-xs font-bold text-vk-aqua">{delta}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(210px,0.8fr)]">
        <article className="rounded-md border border-white/8 bg-white/6 p-4">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xs font-black text-white">Ventas por mes</h3>
            <span className="text-xs font-bold text-vk-aqua">+18%</span>
          </div>
          <div className="relative h-40 overflow-hidden rounded-md bg-vk-navy/60">
            <div className="absolute inset-0 grid grid-rows-4">
              {[1, 2, 3, 4].map((line) => (
                <span key={line} className="border-t border-white/8" />
              ))}
            </div>
            <LineSegment className="left-[8%] top-[64%] w-[17%] rotate-[-12deg]" />
            <LineSegment className="left-[22%] top-[55%] w-[18%] rotate-[-15deg]" />
            <LineSegment className="left-[38%] top-[47%] w-[18%] rotate-[6deg]" />
            <LineSegment className="left-[54%] top-[51%] w-[17%] rotate-[-28deg]" />
            <LineSegment className="left-[68%] top-[34%] w-[19%] rotate-[14deg]" />
            <LineSegment className="left-[84%] top-[32%] w-[11%] rotate-[-30deg]" />
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'].map((month, index) => (
              <span
                key={month}
                className="absolute bottom-2 text-[10px] font-bold text-white/44"
                style={{ left: `${8 + index * 14}%` }}
              >
                {month}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-md border border-white/8 bg-white/6 p-4">
          <h3 className="text-xs font-black text-white">Ventas por categoria</h3>
          <div className="mt-5 flex items-center gap-5">
            <div
              aria-label="Grafico de dona de ventas por categoria"
              className="h-24 w-24 rounded-full p-4"
              style={{
                background:
                  'conic-gradient(var(--color-vk-aqua) 0 45%, var(--color-vk-cobalt) 45% 75%, var(--color-vk-lime) 75% 90%, rgba(255,255,255,0.18) 90% 100%)',
              }}
            >
              <div className="h-full w-full rounded-full bg-vk-navy-2" />
            </div>
            <div className="grid flex-1 gap-2">
              {[
                ['Servicios', '45%'],
                ['Productos', '30%'],
                ['Suscripciones', '15%'],
                ['Otros', '10%'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 text-xs">
                  <span className="text-white/62">{label}</span>
                  <span className="font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="mt-4 rounded-md border border-white/8 bg-white/6 p-4">
        <h3 className="text-xs font-black text-white">Procesos automatizados</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {processItems.map((item) => (
            <div key={item}>
              <p className="text-xs font-bold text-white/70">{item}</p>
              <p className="mt-1 text-xs font-black text-vk-aqua">Automatizado</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function LineSegment({ className }: { className: string }) {
  return <span className={`absolute h-1 origin-left rounded-full bg-vk-aqua ${className}`} />
}

function SectionHeading({
  eyebrow,
  title,
  align = 'left',
}: {
  eyebrow: string
  title: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-vk-cobalt">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-black leading-tight text-vk-navy sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}

function WorkCard({
  number,
  mark,
  title,
  copy,
  tone,
}: {
  number: string
  mark: string
  title: string
  copy: string
  tone: string
}) {
  return (
    <article className="relative z-10 flex flex-col items-center rounded-md border border-vk-line bg-white p-6 text-center shadow-vk">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-black ${tone}`}>
        {mark}
      </span>
      <p className="mt-5 text-sm font-black text-vk-aqua">{number}</p>
      <h3 className="mt-3 font-display text-lg font-black text-vk-navy">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-vk-muted">{copy}</p>
    </article>
  )
}

function ProjectShowcaseCard({
  title,
  copy,
  image,
  tags,
}: {
  title: string
  copy: string
  image: string
  tags: string[]
}) {
  return (
    <article className="overflow-hidden rounded-md border border-vk-line bg-white shadow-[0_12px_32px_rgba(10,22,51,0.08)]">
      <div className="relative aspect-[16/10] bg-vk-navy">
        <Image
          src={image}
          alt={`Vista de ${title}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-black text-vk-navy">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-vk-muted">{copy}</p>
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

function BenefitItem({
  mark,
  title,
  copy,
  color,
}: {
  mark: string
  title: string
  copy: string
  color: string
}) {
  return (
    <article className="text-center">
      <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vk-ice text-lg font-black ${color}`}>
        {mark}
      </span>
      <h3 className="mt-4 font-display text-base font-black text-vk-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-44 text-xs leading-5 text-vk-muted">{copy}</p>
    </article>
  )
}

function NetworkBackdrop() {
  return (
    <>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-vk-aqua/40 to-transparent" />
      <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vk-cobalt/30 to-transparent" />
    </>
  )
}
