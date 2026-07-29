import type { SessionUser } from '@/lib/session'
import { signOut } from '@/app/os/actions'

export function OsHeader({ user }: { user: SessionUser }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-vk-line bg-white px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1">
        <label htmlFor="os-search" className="sr-only">
          Buscar proyectos, clientes o tareas (todavia no disponible)
        </label>
        <input
          id="os-search"
          type="search"
          disabled
          aria-describedby="os-search-hint"
          placeholder="Buscar proyectos, clientes o tareas..."
          className="w-full max-w-sm rounded-md border border-vk-line bg-vk-ice px-3 py-2 text-sm text-vk-muted placeholder:text-vk-muted disabled:cursor-not-allowed"
        />
        <p id="os-search-hint" className="mt-1 text-xs text-vk-muted">
          La busqueda todavia no esta conectada.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Los formularios de creacion todavia no estan conectados."
          className="cursor-not-allowed rounded-md bg-vk-ice px-3 py-2 text-sm font-extrabold text-vk-muted"
        >
          Crear
        </button>

        <span className="hidden text-sm font-bold text-vk-ink sm:inline">{user.fullName}</span>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-vk-line px-3 py-2 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </header>
  )
}
