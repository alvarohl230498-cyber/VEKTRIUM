import Image from 'next/image'

const trustSignals = [
  'Procesos medibles',
  'Integraciones documentadas',
  'Diseño centrado en usuario',
  'Seguridad y trazabilidad',
] as const

const problems = [
  'Reportes dispersos que nadie sabe reconciliar.',
  'Procesos críticos dependiendo de una sola persona.',
  'Reuniones, tareas y entregables sin seguimiento real.',
  'Datos operativos que llegan tarde a la decisión.',
] as const

const services = [
  {
    title: 'Automatización de procesos',
    copy: 'Flujos que reducen trabajo manual, errores repetitivos y tiempos muertos entre áreas.',
  },
  {
    title: 'Data y reporting',
    copy: 'Modelos, tableros y controles para convertir datos dispersos en lectura ejecutiva.',
  },
  {
    title: 'Apps y portales internos',
    copy: 'Herramientas privadas para operar proyectos, clientes, tareas, documentos y aprobaciones.',
  },
  {
    title: 'AI enablement responsable',
    copy: 'Casos de uso con límites claros, trazabilidad y foco en resultados medibles.',
  },
] as const

const method = [
  ['V', 'Ver', 'Entender el proceso real, sus usuarios y puntos de fricción.'],
  ['E', 'Establecer', 'Definir alcance, línea base, riesgos, indicadores y criterios de éxito.'],
  ['K', 'Construir', 'Diseñar e implementar una solución usable, medible y mantenible.'],
  ['T', 'Transformar', 'Acompañar adopción, ajustes y transferencia operativa.'],
  ['O', 'Operar', 'Dejar controles, documentación y responsables claros.'],
  ['R', 'Revisar', 'Medir impacto y proponer mejora continua.'],
] as const

const projects = [
  {
    type: 'Caso demo',
    title: 'Dashboard ejecutivo de RR.HH.',
    result: 'Ausentismo, rotación, headcount y alertas críticas en una sola lectura.',
    tags: ['Power BI', 'RR.HH.', 'Trazabilidad'],
  },
  {
    type: 'Prototipo',
    title: 'Portal de proyectos tipo Planner',
    result: 'Fases, tareas, minutas, Gantt y entregables conectados a un mismo dato.',
    tags: ['Next.js', 'CRM', 'Planner'],
  },
  {
    type: 'Caso demo',
    title: 'Automatización de reportes financieros',
    result: 'Cierre mensual con validaciones, responsables y archivos auditables.',
    tags: ['Finanzas', 'Automatización', 'Control'],
  },
] as const

const packages = [
  ['Start', 'Diagnóstico y primer flujo funcional para validar valor rápido.'],
  ['Scale', 'Automatización, dashboard o portal interno con soporte de adopción.'],
  ['Partner', 'Acompañamiento continuo para operaciones, datos y mejora digital.'],
] as const

export default function Home() {
  return (
    <main className="min-h-screen bg-vk-ice text-vk-ink">
      <header className="sticky top-0 z-30 border-b border-vk-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="font-display text-xl font-extrabold tracking-wide text-vk-navy">
            VEKTRIUM
          </a>
          <nav aria-label="Navegación pública" className="hidden items-center gap-6 text-sm font-semibold text-vk-muted lg:flex">
            <a className="hover:text-vk-cobalt" href="#servicios">
              Servicios
            </a>
            <a className="hover:text-vk-cobalt" href="#metodo">
              Método
            </a>
            <a className="hover:text-vk-cobalt" href="#proyectos">
              Proyectos
            </a>
            <a className="hover:text-vk-cobalt" href="#paquetes">
              Paquetes
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-md border border-vk-line px-3 py-2 text-sm font-bold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt sm:inline-flex"
              href="/os"
            >
              Portal
            </a>
            <a
              className="rounded-md bg-vk-cobalt px-3 py-2 text-sm font-bold text-white transition hover:bg-vk-navy"
              href="#contacto"
            >
              Solicitar diagnóstico
            </a>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[86vh] overflow-hidden">
        <Image
          src="/hero-vektrium.png"
          alt="Paneles de automatización y analítica de VEKTRIUM"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(242,246,252,0.98)_0%,rgba(242,246,252,0.88)_34%,rgba(242,246,252,0.42)_62%,rgba(10,22,51,0.08)_100%)]" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-vk-cobalt">
              Automatización, Datos y Productos Digitales
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] text-vk-navy sm:text-6xl lg:text-7xl">
              VEKTRIUM
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-vk-ink">
              Convertimos problemas operativos reales en sistemas medibles: menos trabajo manual, más
              trazabilidad y mejores decisiones.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-md bg-vk-navy px-5 py-3 text-sm font-extrabold text-white transition hover:bg-vk-cobalt" href="#contacto">
                Solicitar diagnóstico
              </a>
              <a className="rounded-md border border-vk-line bg-white px-5 py-3 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt" href="#proyectos">
                Ver proyectos
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-vk-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustSignals.map((signal) => (
            <p key={signal} className="text-sm font-bold text-vk-navy">
              {signal}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">Problemas reconocibles</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
            La tecnología entra cuando el proceso ya fue entendido.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {problems.map((problem) => (
            <article key={problem} className="border border-vk-line bg-white p-5">
              <p className="text-base font-bold leading-7 text-vk-ink">{problem}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="servicios" className="bg-vk-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-aqua">Servicios</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
              Soluciones para operar mejor, no solo para verse mejor.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <article key={service.title} className="border border-white/15 bg-white/8 p-5">
                <h3 className="font-display text-xl font-extrabold">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#DCE7FF]">{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="metodo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">Método V.E.K.T.O.R.</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
              Un recorrido simple para construir con control.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {method.map(([letter, title, copy]) => (
              <article key={letter} className="border border-vk-line bg-white p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-vk-lime text-sm font-black text-vk-navy">
                  {letter}
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold text-vk-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-vk-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="proyectos" className="border-y border-vk-line bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">Vektrium Proof</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
                Casos y demos con contexto, solución y resultado.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-vk-muted">
              Todo dato ficticio se etiqueta como ilustrativo. Los casos reales nunca exponen información
              personal o confidencial sin autorización.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {projects.map((project) => (
              <article key={project.title} className="border border-vk-line bg-vk-ice p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">{project.type}</p>
                <h3 className="mt-4 font-display text-2xl font-extrabold text-vk-navy">{project.title}</h3>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{project.result}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-white px-2 py-1 text-xs font-bold text-vk-navy">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div className="bg-vk-navy p-6 text-white">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-aqua">VEKTRIUM OS</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Portal privado para fundadores y operación.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#DCE7FF]">
            Reuniones, oportunidades, clientes, proyectos, tareas, fases, minutas, entregables,
            auditoría y calendario conectados en una misma base.
          </p>
          <a className="mt-8 inline-flex rounded-md bg-white px-4 py-3 text-sm font-extrabold text-vk-navy transition hover:bg-vk-lime" href="/os">
            Ver portal privado
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {['Agenda con Google Meet', 'Planner, Gantt y fases', 'CRM ligero', 'Auditoría y permisos'].map((item) => (
            <article key={item} className="border border-vk-line bg-white p-5">
              <h3 className="font-bold text-vk-navy">{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-vk-line bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">Fundadores</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
              Negocio, operaciones y producto en la misma mesa.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="border border-vk-line bg-vk-ice p-5">
              <h3 className="font-display text-xl font-extrabold text-vk-navy">Juan Diego Salazar Campos</h3>
              <p className="mt-3 text-sm leading-7 text-vk-muted">
                Finanzas, estrategia, evaluación económica y relación comercial.
              </p>
            </article>
            <article className="border border-vk-line bg-vk-ice p-5">
              <h3 className="font-display text-xl font-extrabold text-vk-navy">Álvaro Rodrigo Hernandez Laos</h3>
              <p className="mt-3 text-sm leading-7 text-vk-muted">
                Administración, Recursos Humanos, operaciones, procesos y producto.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="paquetes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-cobalt">Paquetes</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-vk-navy sm:text-4xl">
            Empezar chico, escalar con evidencia.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {packages.map(([name, copy]) => (
            <article key={name} className="border border-vk-line bg-white p-6">
              <h3 className="font-display text-2xl font-extrabold text-vk-navy">{name}</h3>
              <p className="mt-4 text-sm leading-7 text-vk-muted">{copy}</p>
              <p className="mt-8 text-sm font-bold text-vk-cobalt">Cotización según alcance</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="bg-vk-navy py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-vk-aqua">Contacto</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold">Solicita un Diagnóstico Vektor.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#DCE7FF]">
              Cuéntanos qué proceso te consume tiempo, qué reporte no llega a tiempo o qué operación
              necesita más control. Respondemos con una ruta concreta de trabajo.
            </p>
          </div>
          <form className="space-y-3 bg-white p-5 text-vk-ink">
            <label className="block">
              <span className="text-sm font-bold text-vk-navy">Nombre</span>
              <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="name" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-vk-navy">Correo</span>
              <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="email" type="email" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-vk-navy">Necesidad</span>
              <textarea className="mt-2 min-h-28 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="need" />
            </label>
            <button className="w-full rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy" type="button">
              Enviar solicitud
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
