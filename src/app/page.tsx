const portfolio = [
  { label: 'Proyectos activos', value: '08', detail: '3 entregas esta semana', tone: 'bg-vk-cobalt text-white' },
  { label: 'En riesgo', value: '02', detail: 'Requieren definicion', tone: 'bg-vk-warning text-white' },
  { label: 'Oportunidades', value: '14', detail: 'S/ 48k en propuesta', tone: 'bg-vk-aqua text-vk-navy' },
  { label: 'Alertas criticas', value: '05', detail: 'Pendientes de hoy', tone: 'bg-vk-danger text-white' },
] as const

const attention = [
  { title: 'Minuta pendiente', meta: 'Diagnostico Vektor - Acme Retail', status: 'Hoy' },
  { title: 'Cliente espera propuesta', meta: 'Automatizacion de reportes RR.HH.', status: '24 h' },
  { title: 'Tarea bloqueada', meta: 'Acceso a Google Calendar corporativo', status: 'Bloqueo' },
] as const

const meetings = [
  { time: '09:30', title: 'Primera reunion de descubrimiento', client: 'ClimaLab' },
  { time: '12:00', title: 'Revision de avance', client: 'Grupo Transmeridian' },
  { time: '16:30', title: 'Presentacion de prototipo', client: 'FinovaAI' },
] as const

const projects = [
  { name: 'Dashboard operativo RR.HH.', progress: '72%', health: 'En curso', color: 'bg-vk-success' },
  { name: 'Portal de minutas y tareas', progress: '41%', health: 'Riesgo moderado', color: 'bg-vk-warning' },
  { name: 'Automatizacion de reportes financieros', progress: '18%', health: 'Bloqueado', color: 'bg-vk-danger' },
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-vk-line bg-white px-4 py-3">
          <div>
            <p className="font-display text-xl font-extrabold text-vk-navy">VEKTRIUM</p>
            <p className="text-sm text-vk-muted">Automatizacion, datos y productos digitales</p>
          </div>
          <nav aria-label="Acciones principales" className="flex flex-wrap gap-2">
            <a
              className="rounded-md border border-vk-line px-3 py-2 text-sm font-semibold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
              href="#proyectos"
            >
              Ver proyectos
            </a>
            <a
              className="rounded-md bg-vk-cobalt px-3 py-2 text-sm font-semibold text-white transition hover:bg-vk-navy"
              href="#agenda"
            >
              Agenda de hoy
            </a>
          </nav>
        </header>

        <section className="grid flex-1 gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden border-r border-vk-line bg-vk-navy p-4 text-white lg:block">
            <p className="mb-5 text-sm font-bold">VEKTRIUM OS</p>
            <nav aria-label="Modulos del portal">
              <ul className="space-y-1 text-sm">
                {['Inicio', 'Agenda', 'Oportunidades', 'Clientes', 'Proyectos', 'Auditoria'].map((item) => (
                  <li key={item}>
                    <a
                      className={`block rounded-md px-3 py-2 ${
                        item === 'Inicio' ? 'bg-vk-cobalt text-white' : 'text-[#B8C7E6] hover:bg-vk-navy-2'
                      }`}
                      href="#"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 space-y-4">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="border border-vk-line bg-white p-5">
                <p className="text-sm font-semibold text-vk-cobalt">Panel de fundadores</p>
                <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
                  Menos friccion. Mas control.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-vk-muted">
                  Vista inicial para administrar reuniones, oportunidades, clientes, proyectos, tareas y
                  entregables desde una sola operacion trazable.
                </p>
              </div>

              <div className="border border-vk-line bg-vk-navy p-5 text-white">
                <p className="text-sm text-[#B8C7E6]">Estado de SP-0</p>
                <p className="mt-2 font-display text-2xl font-extrabold">Fundacion tecnica lista</p>
                <div className="mt-4 h-2 overflow-hidden rounded bg-vk-navy-2">
                  <div className="h-full w-[68%] bg-vk-lime" />
                </div>
                <p className="mt-3 text-sm text-[#DCE7FF]">Permisos, dominio, Drizzle y seguridad base en verde.</p>
              </div>
            </section>

            <section aria-label="Resumen de cartera" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {portfolio.map((item) => (
                <article key={item.label} className="border border-vk-line bg-white p-4">
                  <div className={`mb-4 inline-flex rounded-md px-2 py-1 text-xs font-bold ${item.tone}`}>
                    {item.value}
                  </div>
                  <h2 className="text-sm font-bold text-vk-navy">{item.label}</h2>
                  <p className="mt-1 text-sm text-vk-muted">{item.detail}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div id="proyectos" className="border border-vk-line bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-extrabold text-vk-navy">Salud de proyectos</h2>
                  <span className="rounded-md bg-vk-ice px-2 py-1 text-xs font-semibold text-vk-muted">Vista Planner</span>
                </div>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <article key={project.name} className="border-b border-vk-line pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-vk-ink">{project.name}</h3>
                        <span className="text-sm font-bold text-vk-navy">{project.progress}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded bg-vk-ice">
                        <div className={`h-full ${project.color}`} style={{ width: project.progress }} />
                      </div>
                      <p className="mt-2 text-sm text-vk-muted">{project.health}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <section id="agenda" className="border border-vk-line bg-white p-5">
                  <h2 className="font-display text-xl font-extrabold text-vk-navy">Agenda de hoy</h2>
                  <div className="mt-4 space-y-3">
                    {meetings.map((meeting) => (
                      <article key={`${meeting.time}-${meeting.title}`} className="grid grid-cols-[56px_1fr] gap-3">
                        <time className="rounded-md bg-vk-ice px-2 py-2 text-center text-sm font-bold text-vk-cobalt">
                          {meeting.time}
                        </time>
                        <div>
                          <h3 className="text-sm font-bold text-vk-ink">{meeting.title}</h3>
                          <p className="text-sm text-vk-muted">{meeting.client}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="border border-vk-line bg-white p-5">
                  <h2 className="font-display text-xl font-extrabold text-vk-navy">Necesita atencion</h2>
                  <div className="mt-4 space-y-3">
                    {attention.map((item) => (
                      <article key={item.title} className="flex items-start justify-between gap-3 border-b border-vk-line pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <h3 className="text-sm font-bold text-vk-ink">{item.title}</h3>
                          <p className="text-sm text-vk-muted">{item.meta}</p>
                        </div>
                        <span className="rounded-md bg-vk-ice px-2 py-1 text-xs font-bold text-vk-navy">{item.status}</span>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
