import type { Metadata } from 'next'
import { getRepository } from '@/data'
import { requireSession } from '@/lib/session'
import { NewOpportunityForm } from './new-opportunity-form'
import { OpportunityBoard } from './opportunity-board'

export const metadata: Metadata = {
  title: 'Oportunidades',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OportunidadesPage() {
  const session = await requireSession()

  const repository = getRepository(session.user.id)
  const [opportunities, clients, users] = await Promise.all([
    repository.listOpportunities(),
    repository.listClients(),
    repository.listUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Oportunidades</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">Embudo comercial</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          Los 13 estados completos del embudo, sin recortar. Cambia el estado desde la tabla o el Kanban; una
          transición inválida se rechaza con el motivo exacto, y pasar a &quot;No aceptado&quot; exige registrar
          el motivo de pérdida.
        </p>
      </div>

      <NewOpportunityForm clients={clients} users={users} />

      <OpportunityBoard opportunities={opportunities} clients={clients} users={users} />
    </div>
  )
}
