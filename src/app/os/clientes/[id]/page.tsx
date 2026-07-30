import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRepository } from '@/data'
import { IllustrativeBadge, SimulatedBadge } from '@/components/os/illustrative-badge'
import { MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { buildClientActivity } from '@/lib/clients'
import { formatLima } from '@/lib/dashboard'
import {
  CLIENT_CONFIDENTIALITY_LABELS,
  CLIENT_SIZE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  PROJECT_HEALTH_ICON,
  PROJECT_HEALTH_LABELS,
  PROJECT_HEALTH_TEXT_CLASS,
} from '@/lib/labels'
import { requireSession } from '@/lib/session'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const repository = getRepository()
  const client = await repository.getClientById(id)
  return {
    title: client ? (client.tradeName ?? client.legalName) : 'Cliente',
    robots: { index: false, follow: false },
  }
}

export default async function ClientDetailPage({ params }: { params: Params }) {
  await requireSession()
  const { id } = await params

  const repository = getRepository()
  const client = await repository.getClientById(id)
  // Recurso inexistente: 404, nunca 403 — evita confirmar por URL directa que un id existe (seccion 8 del diseno).
  if (!client) notFound()

  const [contacts, opportunities, projects, meetings, users] = await Promise.all([
    repository.listContactsByClient(id),
    repository.listOpportunities(),
    repository.listProjects(),
    repository.listMeetings(),
    repository.listUsers(),
  ])
  const userById = new Map(users.map((u) => [u.id, u]))

  const clientOpportunities = opportunities.filter((o) => o.clientId === id)
  const clientProjects = projects.filter((p) => p.clientId === id)
  const clientMeetings = meetings.filter((m) => m.clientId === id)
  const activity = buildClientActivity({
    opportunities: clientOpportunities,
    projects: clientProjects,
    meetings: clientMeetings,
  })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/os/clientes" className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
          ← Volver a clientes
        </Link>
      </div>

      <div className="border border-vk-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Cliente</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-vk-navy">{client.tradeName ?? client.legalName}</h1>
            <p className="mt-1 text-sm text-vk-muted">{client.legalName}</p>
          </div>
          {client.isIllustrative ? <IllustrativeBadge /> : null}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">RUC</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{client.ruc ?? 'No registrado'}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Rubro</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{client.industry}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Tamaño</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{CLIENT_SIZE_LABELS[client.size]}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Confidencialidad</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{CLIENT_CONFIDENTIALITY_LABELS[client.confidentiality]}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Ciudad</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{client.city}, {client.country}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Cliente desde</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{formatLima(new Date(client.createdAt))}</dd>
          </div>
        </dl>
      </div>

      <section aria-labelledby="contactos-heading" className="border border-vk-line bg-white p-6">
        <h2 id="contactos-heading" className="font-display text-xl font-extrabold text-vk-navy">
          Contactos
        </h2>
        {contacts.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-vk-muted">
            Este cliente todavía no tiene contactos registrados.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="border border-vk-line p-4">
                <p className="flex items-center gap-2 font-bold text-vk-ink">
                  {contact.fullName}
                  {contact.isPrimary ? (
                    <span className="rounded-md bg-vk-ice px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-vk-cobalt">
                      Principal
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-vk-muted">{contact.position}</p>
                <p className="mt-1 text-sm text-vk-muted">{contact.email}</p>
                {contact.phone ? <p className="text-sm text-vk-muted">{contact.phone}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="oportunidades-heading" className="border border-vk-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="oportunidades-heading" className="font-display text-xl font-extrabold text-vk-navy">
            Oportunidades
          </h2>
          <Link href="/os/oportunidades" className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
            Ver todas
          </Link>
        </div>
        {clientOpportunities.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-vk-muted">Sin oportunidades registradas para este cliente.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {clientOpportunities.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-vk-line pb-2 last:border-b-0">
                <Link href={`/os/oportunidades/${o.id}`} className="font-bold text-vk-cobalt hover:text-vk-navy">
                  {o.title}
                </Link>
                <span className="text-sm text-vk-muted">{OPPORTUNITY_STATUS_LABELS[o.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="proyectos-heading" className="border border-vk-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="proyectos-heading" className="font-display text-xl font-extrabold text-vk-navy">
            Proyectos
          </h2>
          <Link href="/os/proyectos" className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
            Ver todos
          </Link>
        </div>
        {clientProjects.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-vk-muted">Sin proyectos para este cliente todavía.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {clientProjects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-vk-line pb-2 last:border-b-0">
                <Link href={`/os/proyectos/${p.id}`} className="font-bold text-vk-cobalt hover:text-vk-navy">
                  {p.code} · {p.name}
                </Link>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${PROJECT_HEALTH_TEXT_CLASS[p.health]}`}>
                  <span aria-hidden="true">{PROJECT_HEALTH_ICON[p.health]}</span>
                  {PROJECT_HEALTH_LABELS[p.health]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="actividad-heading" className="border border-vk-line bg-white p-6">
        <h2 id="actividad-heading" className="font-display text-xl font-extrabold text-vk-navy">
          Actividad
        </h2>
        <p className="mt-1 text-sm text-vk-muted">
          Oportunidades, proyectos y reuniones de este cliente, en una sola línea de tiempo.
        </p>

        {activity.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-vk-muted">Todavía no hay actividad registrada.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {activity.map((item) => {
              const meeting = item.kind === 'reunion' ? clientMeetings.find((m) => `meeting-${m.id}` === item.id) : undefined
              return (
                <li key={item.id} className="border-b border-vk-line pb-3 last:border-b-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-vk-ice px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                      {item.kind === 'oportunidad' ? 'Oportunidad' : item.kind === 'proyecto' ? 'Proyecto' : 'Reunión'}
                    </span>
                    <span className="text-xs text-vk-muted">
                      {formatLima(new Date(item.at))}
                      {meeting ? ` · ${formatLimaTime(new Date(meeting.startsAt))}` : ''}
                    </span>
                    {meeting?.isMock ? <SimulatedBadge /> : null}
                  </div>
                  <p className="mt-1 text-sm font-bold text-vk-ink">{item.title}</p>
                  <p className="text-sm text-vk-muted">
                    {meeting
                      ? `${MEETING_TYPE_LABELS[meeting.type]} · organizador ${userById.get(meeting.organizerId)?.fullName ?? 'desconocido'}`
                      : item.description}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
