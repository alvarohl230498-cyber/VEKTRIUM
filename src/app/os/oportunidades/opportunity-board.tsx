'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Client, Opportunity, User } from '@/data'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import { formatLima } from '@/lib/dashboard'
import { OPPORTUNITY_KANBAN_ORDER, OPPORTUNITY_STATUS_LABELS } from '@/lib/labels'
import { TransitionForm } from './transition-form'

type ViewMode = 'tabla' | 'kanban'

const currency = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })

export function OpportunityBoard({
  opportunities,
  clients,
  users,
}: {
  opportunities: Opportunity[]
  clients: Client[]
  users: User[]
}) {
  const [view, setView] = useState<ViewMode>('tabla')
  const clientById = new Map(clients.map((c) => [c.id, c]))
  const userById = new Map(users.map((u) => [u.id, u]))

  if (opportunities.length === 0) {
    return (
      <div className="border border-vk-line bg-white p-8 text-center">
        <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay oportunidades</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
          Usa el formulario &quot;Nueva oportunidad&quot; de arriba para registrar el primer prospecto. Empieza
          siempre en el estado &quot;Nuevo lead&quot;.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Vista de oportunidades" className="inline-flex rounded-md border border-vk-line bg-white p-1">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'tabla'}
          onClick={() => setView('tabla')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'tabla' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Tabla
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'kanban'}
          onClick={() => setView('kanban')}
          className={`rounded-md px-3 py-1.5 text-sm font-extrabold transition ${view === 'kanban' ? 'bg-vk-cobalt text-white' : 'text-vk-navy hover:bg-vk-ice'}`}
        >
          Kanban
        </button>
      </div>

      {view === 'tabla' ? (
        <div className="overflow-x-auto border border-vk-line bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-vk-line text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">
                <th scope="col" className="px-4 py-3">Oportunidad</th>
                <th scope="col" className="px-4 py-3">Cliente</th>
                <th scope="col" className="px-4 py-3">Monto</th>
                <th scope="col" className="px-4 py-3">Responsable</th>
                <th scope="col" className="px-4 py-3">Actualizada</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b border-vk-line align-top last:border-b-0 hover:bg-vk-ice">
                  <td className="px-4 py-3">
                    <Link href={`/os/oportunidades/${o.id}`} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                      {o.title}
                    </Link>
                    {o.isIllustrative ? (
                      <div className="mt-1">
                        <IllustrativeBadge />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-vk-ink">{clientById.get(o.clientId)?.tradeName ?? 'Cliente desconocido'}</td>
                  <td className="px-4 py-3 text-vk-ink">{currency.format(o.expectedAmount)}</td>
                  <td className="px-4 py-3 text-vk-ink">{userById.get(o.ownerId)?.fullName ?? 'Sin asignar'}</td>
                  <td className="px-4 py-3 text-vk-ink">{formatLima(new Date(o.updatedAt))}</td>
                  <td className="min-w-[260px] px-4 py-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                      {OPPORTUNITY_STATUS_LABELS[o.status]}
                    </p>
                    <TransitionForm opportunityId={o.id} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-3 pb-2">
            {OPPORTUNITY_KANBAN_ORDER.map((status) => {
              const columnOpportunities = opportunities.filter((o) => o.status === status)
              return (
                <section key={status} aria-label={OPPORTUNITY_STATUS_LABELS[status]} className="w-72 shrink-0 border border-vk-line bg-vk-ice/60 p-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-navy">
                    {OPPORTUNITY_STATUS_LABELS[status]} <span className="text-vk-muted">({columnOpportunities.length})</span>
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {columnOpportunities.map((o) => (
                      <li key={o.id} className="border border-vk-line bg-white p-3">
                        <Link href={`/os/oportunidades/${o.id}`} className="text-sm font-extrabold text-vk-cobalt hover:text-vk-navy">
                          {o.title}
                        </Link>
                        <p className="mt-1 text-xs text-vk-muted">{clientById.get(o.clientId)?.tradeName ?? 'Cliente desconocido'}</p>
                        <p className="text-xs font-bold text-vk-ink">{currency.format(o.expectedAmount)}</p>
                        <TransitionForm opportunityId={o.id} currentStatus={o.status} />
                      </li>
                    ))}
                    {columnOpportunities.length === 0 ? <li className="text-xs text-vk-muted">Sin oportunidades.</li> : null}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
