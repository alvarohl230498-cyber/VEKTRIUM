import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { AutomationNetwork } from '@/components/site/automation-network'
import { PageTransition } from '@/components/site/page-transition'
import { Reveal } from '@/components/site/reveal'
import { brand, firstReportOffer, legalNav, publicNav, type Project } from '@/site/content'

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site min-h-screen bg-vk-ice text-vk-ink">
      <PublicHeader />
      <PageTransition>{children}</PageTransition>
      <PublicFooter />
    </div>
  )
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-vk-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandWordmark />
        <nav
          aria-label="Navegacion publica"
          className="hidden items-center gap-5 text-sm font-extrabold text-white/70 lg:flex"
        >
          {publicNav.map((item) => (
            <Link key={item.href} className="transition hover:text-vk-lime" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            className="hidden items-center gap-2 rounded-md border border-white/18 bg-white/8 px-3 py-2 text-sm font-extrabold text-white transition hover:border-vk-aqua hover:text-vk-aqua sm:inline-flex"
            href="/agenda"
          >
            <CalendarDays aria-hidden="true" size={16} strokeWidth={2.4} />
            Agenda gratis
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-vk-lime px-3 py-2 text-sm font-black text-vk-navy shadow-[0_16px_36px_rgba(183,243,74,0.20)] transition hover:-translate-y-0.5 hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
            href="/contacto"
          >
            Primer reporte
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2.6} />
          </Link>
        </div>
      </div>
      <nav
        aria-label="Navegacion publica movil"
        className="grid grid-cols-3 gap-2 border-t border-white/10 bg-vk-navy-2 px-4 py-3 text-sm font-bold text-white/72 sm:flex lg:hidden"
      >
        {publicNav.map((item) => (
          <Link
            key={item.href}
            className="rounded-md border border-white/8 bg-white/6 px-3 py-2 text-center transition hover:border-vk-aqua hover:text-vk-aqua sm:text-left"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-vk-navy text-white">
      <ImpactBackdrop />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] lg:px-8">
        <div>
          <BrandWordmark />
          <p className="mt-4 max-w-md text-sm leading-7 text-[#DCE7FF]">{brand.tagline}</p>
          <p className="mt-3 max-w-md text-xs font-semibold leading-6 text-[#BFD0F4]">
            {brand.description}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FooterGroup title="Sitio">
            {publicNav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
            <FooterLink href="/vek-proof">Vektrium Proof</FooterLink>
            <FooterLink href="/contacto">Contacto</FooterLink>
          </FooterGroup>
          <FooterGroup title="Legal">
            {legalNav.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterGroup>
        </div>
        <div className="border border-white/14 bg-white/8 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
          <p className="text-sm font-extrabold text-vk-aqua">{firstReportOffer.eyebrow}</p>
          <p className="mt-2 text-sm leading-6 text-[#DCE7FF]">{firstReportOffer.detail}</p>
          <Link
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-vk-lime px-4 py-3 text-sm font-black text-vk-navy transition hover:-translate-y-0.5 hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
            href="/contacto"
          >
            Agendar
            <ArrowRight aria-hidden="true" size={16} strokeWidth={2.6} />
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-white">{title}</p>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-[#BFD0F4]">{children}</div>
    </div>
  )
}

function FooterLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link className="transition hover:text-vk-lime" href={href}>
      {children}
    </Link>
  )
}

export function PageHero({
  eyebrow,
  title,
  copy,
  actions,
}: {
  eyebrow: string
  title: string
  copy: string
  actions?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-vk-navy text-white">
      <ImpactBackdrop />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.55fr)] lg:items-center lg:px-8 lg:py-20">
        <Reveal>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">{eyebrow}</p>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#DCE7FF] sm:text-lg">{copy}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </Reveal>

        <Reveal delay={0.1} className="border border-white/14 bg-vk-navy-2/85 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-vk-aqua">
                Ruta de entrada
              </p>
              <h2 className="mt-2 font-display text-2xl font-black text-white">
                Primer reporte
              </h2>
            </div>
            <ShieldCheck aria-hidden="true" className="text-vk-lime" size={28} strokeWidth={2.2} />
          </div>
          <p className="mt-4 text-sm font-bold leading-7 text-[#DCE7FF]">
            {firstReportOffer.headline}
          </p>
          <div className="mt-5 grid gap-3">
            {firstReportOffer.steps.slice(0, 3).map((step, index) => (
              <div key={step} className="flex gap-3 border border-white/10 bg-white/7 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vk-lime text-xs font-black text-vk-navy">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-xs font-semibold leading-5 text-[#BFD0F4]">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold leading-6 text-[#BFD0F4]">
            {firstReportOffer.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

export function SectionIntro({
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

export function PrimaryLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-md bg-vk-lime px-5 py-3 text-sm font-black text-vk-navy shadow-[0_18px_42px_rgba(183,243,74,0.22)] transition hover:-translate-y-0.5 hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2"
      href={href}
    >
      {children}
      <ArrowRight aria-hidden="true" size={16} strokeWidth={2.6} />
    </Link>
  )
}

export function SecondaryLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-md border border-vk-line bg-white px-5 py-3 text-sm font-black text-vk-navy transition hover:-translate-y-0.5 hover:border-vk-cobalt hover:text-vk-cobalt focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
      href={href}
    >
      {children}
      <ExternalLink aria-hidden="true" size={15} strokeWidth={2.4} />
    </Link>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-vk-line bg-white p-5 shadow-[0_16px_42px_rgba(10,22,51,0.08)]">
      {project.image ? (
        <div className="relative -mx-5 -mt-5 mb-5 aspect-video overflow-hidden border-b border-vk-line bg-vk-ice">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-vk-navy px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
          {project.kind}
        </span>
        {project.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-md bg-vk-ice px-2 py-1 text-xs font-bold text-vk-navy">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-5 font-display text-2xl font-black leading-tight text-vk-navy">
        {project.title}
      </h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-vk-muted">{project.summary}</p>
      <Link
        className="mt-6 inline-flex items-center gap-2 text-sm font-black text-vk-cobalt transition hover:text-vk-navy"
        href={`/proyectos/${project.slug}`}
      >
        Ver caso
        <ArrowRight aria-hidden="true" size={15} strokeWidth={2.6} />
      </Link>
    </article>
  )
}

export function ContactBand() {
  return (
    <section className="relative isolate overflow-hidden bg-vk-navy py-16 text-white">
      <ImpactBackdrop />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-vk-aqua">
            {firstReportOffer.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">
            {firstReportOffer.headline}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#DCE7FF]">
            {firstReportOffer.detail}
          </p>
          <p className="mt-3 max-w-2xl text-xs font-semibold leading-6 text-[#BFD0F4]">
            {firstReportOffer.note}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-vk-lime px-5 py-3 text-sm font-black text-vk-navy transition hover:-translate-y-0.5 hover:bg-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-lime focus:ring-offset-2 focus:ring-offset-vk-navy"
              href="/contacto"
            >
              Agendar primer reporte
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2.6} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/8 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-vk-aqua hover:text-vk-aqua focus:outline-none focus:ring-2 focus:ring-vk-aqua focus:ring-offset-2 focus:ring-offset-vk-navy"
              href="/agenda"
            >
              Ver agenda gratis
              <CalendarDays aria-hidden="true" size={16} strokeWidth={2.4} />
            </Link>
          </div>
        </div>
        <aside className="border border-white/14 bg-vk-navy-2/80 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3">
            <Layers aria-hidden="true" className="text-vk-lime" size={24} strokeWidth={2.4} />
            <h3 className="font-display text-2xl font-black text-white">Como empieza</h3>
          </div>
          <div className="mt-5 grid gap-3">
            {firstReportOffer.steps.map((step) => (
              <div key={step} className="flex gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-vk-aqua" size={17} />
                <p className="text-sm font-semibold leading-6 text-[#DCE7FF]">{step}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

export function HeroImage() {
  return (
    <Image
      src="/hero-vektrium.png"
      alt="Panel visual con tableros y flujos de automatizacion de VEKTRIUM"
      fill
      priority
      className="object-cover object-center"
      sizes="100vw"
    />
  )
}

function BrandWordmark() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Inicio VEKTRIUM">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-vk-lime font-display text-lg font-black text-vk-navy shadow-[0_12px_28px_rgba(183,243,74,0.22)]">
        V
      </span>
      <span className="font-display text-xl font-black text-white">{brand.name}</span>
    </Link>
  )
}

function ImpactBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <AutomationNetwork density={22} />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:82px_82px]" />
      <div className="absolute left-0 top-24 h-px w-full bg-gradient-to-r from-transparent via-vk-aqua/45 to-transparent" />
      <div className="absolute bottom-12 left-0 h-px w-full bg-gradient-to-r from-transparent via-vk-cobalt/35 to-transparent" />
      <div className="absolute -right-40 top-16 h-[420px] w-[640px] rotate-6 border border-vk-aqua/14" />
      <div className="absolute -right-20 top-36 h-[360px] w-[520px] rotate-6 border border-vk-cobalt/14" />
    </div>
  )
}
