import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import { getRepository } from '@/data'
import { requireSession } from '@/lib/session'
import { AgendaView } from './agenda-view'
import { NewMeetingForm } from './meeting-form'

export const metadata: Metadata = {
  title: 'Agenda',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AgendaPage() {
  await requireSession()

  const repository = getRepository()
  const [meetings, clients, projects, users] = await Promise.all([
    repository.listMeetings(),
    repository.listClients(),
    repository.listProjects(),
    repository.listUsers(),
  ])

  const contacts = (await Promise.all(clients.map((c) => repository.listContactsByClient(c.id)))).flat()

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Agenda</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">
          Reuniones con clientes y del equipo
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          Aquí Juan Diego y Álvaro agendan reuniones, ven quién asiste y en qué proyecto o cliente encajan. Sin
          credenciales de Google conectadas, los enlaces de videollamada se generan con un proveedor simulado,
          siempre marcado con la insignia SIMULADO.
        </p>
      </div>

      <NewMeetingForm clients={clients} projects={projects} users={users} contacts={contacts} requestId={randomUUID()} />

      <AgendaView meetings={meetings} clients={clients} projects={projects} users={users} nowIso={new Date().toISOString()} />
    </div>
  )
}
