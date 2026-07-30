import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRepository } from '@/data'
import { IllustrativeBadge, SimulatedBadge } from '@/components/os/illustrative-badge'
import { MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { formatLima } from '@/lib/dashboard'
import { OPPORTUNITY_STATUS_LABELS } from '@/lib/labels'
import { getSession, requireSession } from '@/lib/session'
import { TransitionForm } from '../transition-form'
import { ConvertForm } from './convert-form'

type Params = Promise<{ id: string }>

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const session = await getSession()
  if (!session) return { title: 'Oportunidad', robots: { index: false, follow: false } }

  const repository = getRepository(session.user.id)
  const opportunity = await repository.getOpportunityById(id)
  return {
    title: opportunity ? opportunity.title : 'Oportunidad',
    robots: { index: false, follow: false },
  }
}

export default async function OpportunityDetailPage({ params }: { params: Params }) {
  const session = await requireSession()
  const { id } = await params

  const repository = getRepository(session.user.id)
  const opportunity = await repository.getOpportunityById(id)
  if (!opportunity) notFound()

  const [client, owner, meetings, projects, users] = await Promise.all([
    repository.getClientById(opportunity.clientId),
    repository.getUserById(opportunity.ownerId),
    repository.listMeetings(),
    repository.listProjects(),
    repository.listUsers(),
  ])

  const clientMeetings = meetings.filter((m) => m.clientId === opportunity.clientId)
  const linkedProject = projects.find((p) => p.opportunityId === opportunity.id)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/os/oportunidades" className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
          ← Volver a oportunidades
        </Link>
      </div>

      <div className="border border-vk-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Oportunidad</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-vk-navy">{opportunity.title}</h1>
            {client ? (
              <p className="mt-1 text-sm text-vk-muted">
                Cliente:{' '}
                <Link href={`/os/clientes/${client.id}`} className="font-bold text-vk-cobalt hover:text-vk-navy">
                  {client.tradeName ?? client.legalName}
                </Link>
              </p>
            ) : null}
          </div>
          {opportunity.isIllustrative ? <IllustrativeBadge /> : null}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Estado actual</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{OPPORTUNITY_STATUS_LABELS[opportunity.status]}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Monto esperado</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{currency.format(opportunity.expectedAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Responsable</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{owner?.fullName ?? 'Sin asignar'}</dd>
          </div>
          <div>
            <dt className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Actualizada</dt>
            <dd className="mt-1 text-sm font-bold text-vk-ink">{formatLima(new Date(opportunity.updatedAt))}</dd>
          </div>
        </dl>

        {opportunity.lossReason ? (
          <p className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm text-vk-danger">
            <span className="font-extrabold">Motivo de pérdida: </span>
            {opportunity.lossReason}
          </p>
        ) : null}

        <div className="mt-6 border-t border-vk-line pt-4">
          <p className="text-sm font-bold text-vk-navy">Cambiar estado</p>
          <TransitionForm opportunityId={opportunity.id} currentStatus={opportunity.status} />
        </div>
      </div>

      {linkedProject ? (
        <div className="border border-vk-line bg-white p-6">
          <h2 className="font-display text-xl font-extrabold text-vk-navy">Proyecto vinculado</h2>
          <p className="mt-2 text-sm">
            <Link href={`/os/proyectos/${linkedProject.id}`} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
              {linkedProject.code} · {linkedProject.name}
            </Link>
          </p>
        </div>
      ) : (
        <ConvertForm opportunityId={opportunity.id} defaultName={opportunity.title} users={users} />
      )}

      <section aria-labelledby="reuniones-heading" className="border border-vk-line bg-white p-6">
        <h2 id="reuniones-heading" className="font-display text-xl font-extrabold text-vk-navy">
          Reuniones con este cliente
        </h2>
        {clientMeetings.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-vk-muted">
            Sin reuniones registradas. Agenda una desde el módulo Agenda.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {clientMeetings.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-vk-line pb-2 last:border-b-0">
                <div>
                  <p className="text-sm font-bold text-vk-ink">{m.title}</p>
                  <p className="text-xs text-vk-muted">
                    {formatLima(new Date(m.startsAt))} · {formatLimaTime(new Date(m.startsAt))} · {MEETING_TYPE_LABELS[m.type]}
                  </p>
                </div>
                {m.isMock ? <SimulatedBadge /> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
