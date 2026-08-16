type PreviewMetric = {
  label: string
  value?: string
  helper?: string
}

export type AutomationPreviewPanelProps = {
  title?: string
  subtitle?: string
  metrics?: PreviewMetric[]
}

const emptyMetrics: PreviewMetric[] = [
  { label: 'Indicador principal' },
  { label: 'Tiempo operativo' },
  { label: 'Estado del proceso' },
]

export function AutomationPreviewPanel({
  title = 'Vista de automatizacion',
  subtitle = 'Datos listos para conectar',
  metrics = emptyMetrics,
}: AutomationPreviewPanelProps) {
  // TODO: conectar con fuente de datos real cuando existan KPIs validados.
  return (
    <aside className="relative">
      <div className="absolute -inset-6 border border-vk-aqua/20" />
      <div className="relative overflow-hidden border border-white/14 bg-vk-navy-2/95 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-vk-aqua">{subtitle}</p>
            <h2 className="mt-2 font-display text-2xl font-black text-white">{title}</h2>
          </div>
          <span className="rounded-md border border-vk-aqua/35 px-3 py-2 text-xs font-black text-vk-aqua">
            Sin datos reales
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold text-[#BFD0F4]">{metric.label}</p>
              <p className="mt-3 font-display text-3xl font-black text-white">{metric.value ?? '—'}</p>
              <p className="mt-2 text-xs font-semibold text-vk-aqua">{metric.helper ?? 'Pendiente de fuente real'}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(190px,0.7fr)]">
          <div className="border border-white/10 bg-white/7 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white">Flujo de proceso</p>
            <div className="mt-5 grid gap-3">
              {[58, 72, 46, 64].map((width, index) => (
                <div key={index} className="h-3 overflow-hidden rounded-md bg-white/8">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-vk-aqua to-vk-lime opacity-70"
                    style={{ width: `${width}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border border-white/10 bg-white/7 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white">Lectura</p>
            <div className="mt-5 grid place-items-center">
              <div className="grid h-32 w-32 place-items-center rounded-full border-[14px] border-vk-aqua/40 text-center">
                <span className="text-xs font-black leading-5 text-[#DCE7FF]">Fuente pendiente</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {['Datos', 'Validacion', 'Reporte', 'Entrega'].map((item) => (
            <div key={item} className="border border-white/10 bg-white/7 px-3 py-3">
              <p className="text-xs font-black text-white">{item}</p>
              <p className="mt-1 text-xs font-semibold text-[#BFD0F4]">—</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
