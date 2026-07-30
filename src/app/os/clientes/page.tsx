import type { Metadata } from 'next'
import { getRepository } from '@/data'
import { buildClientRows } from '@/lib/clients'
import { requireSession } from '@/lib/session'
import { ClientList } from './client-list'
import { NewClientForm } from './new-client-form'

export const metadata: Metadata = {
  title: 'Clientes',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ClientesPage() {
  const session = await requireSession()

  const repository = getRepository(session.user.id)
  const [clients, opportunities, projects, meetings] = await Promise.all([
    repository.listClients(),
    repository.listOpportunities(),
    repository.listProjects(),
    repository.listMeetings(),
  ])

  const rows = buildClientRows({ clients, opportunities, projects, meetings })

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Clientes</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">Cartera de clientes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          Busca por nombre o ciudad, filtra por rubro y entra a la ficha de cada cliente para ver contactos,
          oportunidades, proyectos y reuniones en una sola línea de tiempo.
        </p>
      </div>

      <NewClientForm />

      <ClientList rows={rows} />
    </div>
  )
}
