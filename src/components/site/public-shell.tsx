import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { brand, legalNav, publicNav, type Project } from '@/site/content'

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-vk-ice text-vk-ink">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  )
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-vk-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-extrabold text-vk-navy">
          {brand.name}
        </Link>
        <nav
          aria-label="Navegacion publica"
          className="hidden items-center gap-5 text-sm font-bold text-vk-muted lg:flex"
        >
          {publicNav.map((item) => (
            <Link key={item.href} className="transition hover:text-vk-cobalt" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-md border border-vk-line px-3 py-2 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt sm:inline-flex"
            href="/agenda"
          >
            Agenda
          </Link>
          <Link
            className="hidden rounded-md bg-vk-cobalt px-3 py-2 text-sm font-extrabold text-white transition hover:bg-vk-navy sm:inline-flex"
            href="/contacto"
          >
            Solicitar diagnostico
          </Link>
        </div>
      </div>
      <nav
        aria-label="Navegacion publica movil"
        className="grid grid-cols-3 gap-2 border-t border-vk-line px-4 py-3 text-sm font-bold text-vk-muted sm:flex lg:hidden"
      >
        {publicNav.map((item) => (
          <Link
            key={item.href}
            className="rounded-md bg-vk-ice px-3 py-2 text-center transition hover:text-vk-cobalt sm:text-left"
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
    <footer className="border-t border-vk-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px] lg:px-8">
        <div>
          <p className="font-display text-2xl font-extrabold text-vk-navy">{brand.name}</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-vk-muted">{brand.tagline}</p>
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
        <div className="border border-vk-line bg-vk-ice p-4">
          <p className="text-sm font-extrabold text-vk-navy">Diagnostico Vektor</p>
          <p className="mt-2 text-sm leading-6 text-vk-muted">
            Una primera conversacion para ubicar proceso, datos, usuarios, riesgos y siguiente paso.
          </p>
          <Link
            className="mt-4 inline-flex rounded-md bg-vk-navy px-3 py-2 text-sm font-extrabold text-white transition hover:bg-vk-cobalt"
            href="/contacto"
          >
            Empezar
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-vk-navy">{title}</p>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-vk-muted">{children}</div>
    </div>
  )
}

function FooterLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link className="transition hover:text-vk-cobalt" href={href}>
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
    <section className="border-b border-vk-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">{eyebrow}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,760px)_minmax(260px,1fr)] lg:items-end">
          <h1 className="font-display text-4xl font-extrabold leading-tight text-vk-navy sm:text-5xl">
            {title}
          </h1>
          <div>
            <p className="text-base leading-8 text-vk-muted">{copy}</p>
            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>
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
      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-vk-navy sm:text-4xl">
        {title}
      </h2>
      {copy ? <p className="mt-4 text-base leading-8 text-vk-muted">{copy}</p> : null}
    </div>
  )
}

export function PrimaryLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md bg-vk-cobalt px-5 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy"
      href={href}
    >
      {children}
    </Link>
  )
}

export function SecondaryLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="inline-flex rounded-md border border-vk-line bg-white px-5 py-3 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
      href={href}
    >
      {children}
    </Link>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col border border-vk-line bg-white p-5">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-vk-ice px-2 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-vk-cobalt">
          {project.kind}
        </span>
        {project.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-md bg-vk-ice px-2 py-1 text-xs font-bold text-vk-navy">
            {tag}
          </span>
        ))}
      </div>
      <h3 className="mt-5 font-display text-2xl font-extrabold leading-tight text-vk-navy">
        {project.title}
      </h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-vk-muted">{project.summary}</p>
      <Link
        className="mt-6 inline-flex text-sm font-extrabold text-vk-cobalt transition hover:text-vk-navy"
        href={`/proyectos/${project.slug}`}
      >
        Ver caso
      </Link>
    </article>
  )
}

export function ContactBand() {
  return (
    <section className="bg-vk-navy py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-aqua">
            Diagnostico Vektor
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Pongamos el proceso sobre la mesa.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#DCE7FF]">
            En una primera sesion ubicamos dolor operativo, datos disponibles, usuarios, riesgos y
            una ruta de implementacion responsable.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link
            className="rounded-md bg-white px-5 py-3 text-sm font-extrabold text-vk-navy transition hover:bg-vk-lime"
            href="/contacto"
          >
            Solicitar diagnostico
          </Link>
          <Link
            className="rounded-md border border-white/25 px-5 py-3 text-sm font-extrabold text-white transition hover:border-vk-aqua hover:text-vk-aqua"
            href="/agenda"
          >
            Ver agenda
          </Link>
        </div>
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
