const metrics = [
  ['08', 'Proyectos activos'],
  ['14', 'Oportunidades abiertas'],
  ['05', 'Alertas críticas'],
  ['03', 'Entregas esta semana'],
] as const

const tasks = [
  'Minuta pendiente de diagnóstico',
  'Propuesta esperando revisión',
  'Acceso de calendario por conectar',
] as const

export default function OsPreview() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="bg-vk-navy p-5 text-white">
          <p className="font-display text-lg font-extrabold">VEKTRIUM OS</p>
          <nav aria-label="Portal privado" className="mt-8">
            <ul className="space-y-2 text-sm">
              {['Inicio', 'Agenda', 'Oportunidades', 'Clientes', 'Proyectos', 'Auditoría'].map((item) => (
                <li
                  key={item}
                  className={item === 'Inicio' ? 'rounded-md bg-vk-cobalt px-3 py-2 font-bold' : 'px-3 py-2 text-[#B8C7E6]'}
                >
                  {item}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <section className="space-y-4">
          <div className="border border-vk-line bg-white p-6">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">Panel de fundadores</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-vk-navy">Menos fricción. Más control.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-vk-muted">
              Esta es la vista privada que se conectará a autenticación, permisos, reuniones, tareas y proyectos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([value, label]) => (
              <article key={label} className="border border-vk-line bg-white p-5">
                <p className="font-display text-3xl font-extrabold text-vk-cobalt">{value}</p>
                <p className="mt-2 text-sm font-bold text-vk-navy">{label}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="border border-vk-line bg-white p-6">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Salud de proyectos</h2>
              <div className="mt-6 space-y-5">
                {['Dashboard operativo RR.HH.', 'Portal de minutas y tareas', 'Automatización financiera'].map((project, index) => (
                  <article key={project}>
                    <div className="flex justify-between gap-3">
                      <h3 className="font-bold text-vk-ink">{project}</h3>
                      <span className="text-sm font-bold text-vk-navy">{[72, 41, 18][index]}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-md bg-vk-ice">
                      <div className="h-2 rounded-md bg-vk-cobalt" style={{ width: `${[72, 41, 18][index]}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="border border-vk-line bg-white p-6">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Necesita atención</h2>
              <ul className="mt-6 space-y-4">
                {tasks.map((task) => (
                  <li key={task} className="border-b border-vk-line pb-4 text-sm font-bold text-vk-ink last:border-b-0">
                    {task}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
