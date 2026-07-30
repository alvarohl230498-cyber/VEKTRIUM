import type { Metadata } from 'next'
import Link from 'next/link'
import { getRepository } from '@/data'
import { requireSession } from '@/lib/session'
import { ProjectBoard } from './project-board'

export const metadata: Metadata = {
  title: 'Proyectos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProyectosPage() {
  const session = await requireSession()

  const repository = getRepository(session.user.id)
  const [projects, clients, users] = await Promise.all([
    repository.listProjectsWithPhases(),
    repository.listClients(),
    repository.listUsers(),
  ])

  return (
    <div className="space-y-6">
      <div className="border border-vk-line bg-white p-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Proyectos</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-vk-navy">Cartera de proyectos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-vk-muted">
          El avance de cada proyecto es ponderado: se calcula siempre a partir de las tareas, nunca se edita a
          mano. La vista Tablero, en cambio, la mueve el equipo a mano: es la fase en la que dicen que está el
          proyecto ahora.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="border border-vk-line bg-white p-8 text-center">
          <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay proyectos</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
            Los proyectos nacen al convertir una oportunidad. Ve a{' '}
            <Link href="/os/oportunidades" className="font-extrabold text-vk-cobalt hover:text-vk-navy">
              Oportunidades
            </Link>{' '}
            y usa &quot;Convertir en proyecto&quot; sobre una oportunidad ganada.
          </p>
        </div>
      ) : (
        <ProjectBoard initialProjects={projects} clients={clients} users={users} />
      )}
    </div>
  )
}
