'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import rawProjects from '@/site/projects-carousel.json'

type CarouselImage = {
  src: string
  alt: string
}

type CarouselProject = {
  id: string
  order: number
  owner: 'Álvaro' | 'Juan Diego'
  eyebrow: string
  title: string
  summary: string
  description: string
  highlights: string[]
  tags: string[]
  images: CarouselImage[]
  cta: string
}

const projects = [...(rawProjects as CarouselProject[])].sort((a, b) => a.order - b.order)

const imageMeta: Record<string, { width: number; height: number }> = {
  '/projects/01-buk-analytics-demografia.jpeg': { width: 1600, height: 893 },
  '/projects/01-buk-analytics-rotacion.jpeg': { width: 1600, height: 900 },
  '/projects/02-finova-ai.jpeg': { width: 1535, height: 1024 },
  '/projects/03-sistema-remuneraciones.jpeg': { width: 1600, height: 947 },
  '/projects/04-automatizacion-buk.jpeg': { width: 1448, height: 1086 },
  '/projects/05-reportflow.jpeg': { width: 1536, height: 1024 },
  '/projects/06-doclink-qr.jpeg': { width: 1536, height: 1024 },
  '/projects/07-globalmatch.jpeg': { width: 1536, height: 1024 },
}

const fallbackImageMeta = { width: 1600, height: 1000 }

export function ProjectsCarouselSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeImages, setActiveImages] = useState<Record<string, number>>({})
  const [isPaused, setIsPaused] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<CarouselImage | null>(null)
  const touchStartX = useRef<number | null>(null)

  const activeProject = projects[activeIndex] ?? projects[0]!
  const activeImageIndex = activeImages[activeProject.id] ?? 0
  const activeImage = activeProject.images[activeImageIndex] ?? activeProject.images[0]!
  const activeImageMeta = useMemo(
    () => imageMeta[activeImage.src] ?? fallbackImageMeta,
    [activeImage.src],
  )
  const activeNumber = formatProjectNumber(activeIndex + 1)
  const progress = ((activeIndex + 1) / projects.length) * 100

  const moveTo = useCallback((nextIndex: number) => {
    setActiveIndex((current) => {
      const normalized = (nextIndex + projects.length) % projects.length
      return Number.isNaN(normalized) ? current : normalized
    })
  }, [])

  const moveBy = useCallback(
    (delta: number) => {
      setActiveIndex((current) => (current + delta + projects.length) % projects.length)
    },
    [],
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const hash = decodeURIComponent(window.location.hash.replace('#', ''))
      const indexFromHash = projects.findIndex((project) => project.id === hash)

      if (indexFromHash >= 0) {
        setActiveIndex(indexFromHash)
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    window.history.replaceState(null, '', `#${activeProject.id}`)
  }, [activeProject.id])

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const interval = window.setInterval(() => moveBy(1), 8000)
    return () => window.clearInterval(interval)
  }, [isPaused, moveBy])

  useEffect(() => {
    if (!lightboxImage) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxImage(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxImage])

  const currentImageMeta = useMemo(
    () => imageMeta[lightboxImage?.src ?? ''] ?? activeImageMeta,
    [activeImageMeta, lightboxImage],
  )

  return (
    <section
      id="proyectos-desarrollados"
      className="overflow-hidden bg-vk-ice py-20"
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
        setIsPaused(true)
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current
        const endX = event.changedTouches[0]?.clientX
        touchStartX.current = null

        if (startX == null || endX == null) {
          return
        }

        const distance = startX - endX
        if (Math.abs(distance) > 42) {
          moveBy(distance > 0 ? 1 : -1)
        }
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">
              Proyectos desarrollados
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-vk-navy sm:text-4xl">
              Soluciones que convierten procesos manuales en resultados útiles
            </h2>
            <p className="mt-4 text-base leading-8 text-vk-muted">
              Diseñamos automatizaciones, aplicaciones y dashboards que conectan datos, simplifican
              tareas y permiten tomar mejores decisiones.
            </p>
          </div>
          <Link
            className="inline-flex rounded-md bg-vk-cobalt px-5 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
            href="/contacto?motivo=proyectos"
          >
            Agendar primer reporte
          </Link>
        </div>

        <div
          aria-label="Carrusel de proyectos desarrollados"
          className="mt-10"
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              moveBy(1)
            }

            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              moveBy(-1)
            }
          }}
          role="region"
          tabIndex={0}
        >
          <p className="sr-only" aria-live="polite">
            Proyecto {activeNumber} de {formatProjectNumber(projects.length)}: {activeProject.title}
          </p>

          <article className="grid min-h-[620px] gap-6 border border-vk-line bg-white p-4 shadow-[0_16px_42px_rgba(10,22,51,0.08)] sm:p-5 lg:grid-cols-[minmax(0,1.62fr)_minmax(330px,1fr)] lg:p-6">
            <div className="order-1">
              <div className="border border-vk-line bg-vk-ice p-3">
                <button
                  aria-label={`Abrir imagen de ${activeProject.title}`}
                  className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-white focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
                  onClick={() => setLightboxImage(activeImage)}
                  type="button"
                >
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    width={activeImageMeta.width}
                    height={activeImageMeta.height}
                    priority={activeIndex <= 1}
                    sizes="(min-width: 1024px) 62vw, 100vw"
                    className="h-full w-full object-contain"
                  />
                </button>
              </div>

              {activeProject.images.length > 1 ? (
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Vistas del proyecto">
                  {activeProject.images.map((image, imageIndex) => {
                    const meta = imageMeta[image.src] ?? activeImageMeta
                    const isActiveImage = imageIndex === activeImageIndex

                    return (
                      <button
                        aria-label={`Ver imagen ${imageIndex + 1} de ${activeProject.title}`}
                        className={`h-14 w-24 rounded-md border bg-white p-1 transition focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2 ${
                          isActiveImage ? 'border-vk-cobalt' : 'border-vk-line hover:border-vk-cobalt'
                        }`}
                        key={image.src}
                        onClick={() =>
                          setActiveImages((current) => ({
                            ...current,
                            [activeProject.id]: imageIndex,
                          }))
                        }
                        type="button"
                      >
                        <Image
                          src={image.src}
                          alt=""
                          width={meta.width}
                          height={meta.height}
                          sizes="96px"
                          className="h-full w-full object-contain"
                        />
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="order-2 flex flex-col justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-md bg-vk-navy px-3 py-2 text-sm font-black text-white">
                    {activeNumber}
                  </span>
                  <span className="text-sm font-extrabold text-vk-muted">
                    {activeNumber} / {formatProjectNumber(projects.length)}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-md bg-vk-ice px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-vk-cobalt">
                    {activeProject.owner}
                  </span>
                  <span className="rounded-md bg-vk-ice px-3 py-2 text-xs font-bold text-vk-navy">
                    {activeProject.eyebrow}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-3xl font-extrabold leading-tight text-vk-navy">
                  {activeProject.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-vk-ink">{activeProject.summary}</p>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{activeProject.description}</p>

                <ul className="mt-6 hidden gap-3 lg:grid">
                  {activeProject.highlights.slice(0, 4).map((highlight) => (
                    <li key={highlight} className="border-t border-vk-line pt-3 text-sm leading-6 text-vk-ink">
                      {highlight}
                    </li>
                  ))}
                </ul>

                <details className="mt-5 rounded-md border border-vk-line bg-vk-ice p-4 lg:hidden">
                  <summary className="cursor-pointer text-sm font-extrabold text-vk-navy">
                    Ver capacidades
                  </summary>
                  <ul className="mt-4 grid gap-3">
                    {activeProject.highlights.slice(0, 4).map((highlight) => (
                      <li key={highlight} className="border-t border-vk-line pt-3 text-sm leading-6 text-vk-ink">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="mt-6 flex flex-wrap gap-2">
                  {activeProject.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-vk-ice px-3 py-2 text-xs font-bold text-vk-navy">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="h-2 overflow-hidden rounded-md bg-vk-ice">
                  <div
                    className="h-full rounded-md bg-vk-cobalt transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    className="inline-flex rounded-md bg-vk-navy px-5 py-3 text-sm font-extrabold text-white transition hover:bg-vk-cobalt focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
                    href={`/contacto?proyecto=${activeProject.id}`}
                  >
                    Agendar reporte similar
                  </Link>
                  <CarouselNavigation
                    activeIndex={activeIndex}
                    moveBy={moveBy}
                    moveTo={moveTo}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {lightboxImage ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-vk-navy/92 p-4"
          onClick={() => setLightboxImage(null)}
          role="dialog"
        >
          <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                aria-label="Cerrar imagen ampliada"
                className="min-h-11 min-w-11 rounded-md bg-white px-4 py-3 text-sm font-extrabold text-vk-navy focus:outline-none focus:ring-2 focus:ring-vk-aqua focus:ring-offset-2 focus:ring-offset-vk-navy"
                onClick={() => setLightboxImage(null)}
                type="button"
              >
                Cerrar
              </button>
            </div>
            <div className="flex max-h-[82vh] items-center justify-center bg-white p-3">
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                width={currentImageMeta.width}
                height={currentImageMeta.height}
                sizes="100vw"
                className="max-h-[78vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function CarouselNavigation({
  activeIndex,
  moveBy,
  moveTo,
}: {
  activeIndex: number
  moveBy: (delta: number) => void
  moveTo: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        aria-label="Proyecto anterior"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-vk-line bg-white text-lg font-black text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
        onClick={() => moveBy(-1)}
        type="button"
      >
        ‹
      </button>
      <div className="flex items-center gap-2">
        {projects.map((project, index) => (
          <button
            aria-label={`Ir al proyecto ${formatProjectNumber(index + 1)}: ${project.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            className={`h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2 ${
              index === activeIndex ? 'w-8 bg-vk-cobalt' : 'w-3 bg-vk-line hover:bg-vk-muted'
            }`}
            key={project.id}
            onClick={() => moveTo(index)}
            type="button"
          />
        ))}
      </div>
      <button
        aria-label="Proyecto siguiente"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-vk-line bg-white text-lg font-black text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt focus:outline-none focus:ring-2 focus:ring-vk-cobalt focus:ring-offset-2"
        onClick={() => moveBy(1)}
        type="button"
      >
        ›
      </button>
    </div>
  )
}

function formatProjectNumber(value: number) {
  return value.toString().padStart(2, '0')
}
