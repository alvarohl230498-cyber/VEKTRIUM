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
  { label: 'Ventas' },
  { label: 'Utilidad' },
  { label: 'Margen' },
]

const processItems = ['Facturacion', 'Reportes', 'Notificaciones', 'Backup']
const categories = ['Servicios', 'Productos', 'Suscripciones', 'Otros']

export function AutomationPreviewPanel({
  title = 'Dashboard operativo',
  subtitle = 'Panel preparado para conectar datos reales',
  metrics = emptyMetrics,
}: AutomationPreviewPanelProps) {
  // TODO: conectar con fuente de datos real cuando existan KPIs validados.
  return (
    <aside className="relative">
      <div className="absolute -inset-5 border border-vk-aqua/20 shadow-[0_0_80px_rgba(31,216,169,0.12)]" />
      <div className="relative overflow-hidden border border-white/14 bg-vk-navy-2/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-black text-white">{title}</p>
            <p className="mt-1 text-xs font-semibold text-[#88A0C9]">
              {subtitle}
            </p>
          </div>
          <span className="border border-vk-aqua/30 px-3 py-1.5 text-xs font-black text-vk-aqua">
            Sin datos
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold text-[#BFD0F4]">{metric.label}</p>
              <p className="mt-3 font-display text-3xl font-black text-white">
                {metric.value ?? '-'}
              </p>
              <p className="mt-2 text-xs font-semibold text-vk-aqua">
                {metric.helper ?? 'Conectar fuente real'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(190px,0.75fr)]">
          <div className="min-h-56 border border-white/10 bg-white/7 p-4">
            <p className="text-xs font-black text-white">Tendencia del reporte</p>
            <div className="relative mt-5 h-36 overflow-hidden border border-white/8 bg-vk-navy/30">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:100%_33%,20%_100%]" />
              <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-vk-aqua/35" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="border border-white/12 bg-vk-navy-2/85 px-3 py-2 text-xs font-black text-[#DCE7FF]">
                  Datos pendientes
                </span>
              </div>
            </div>
          </div>

          <div className="min-h-56 border border-white/10 bg-white/7 p-4">
            <p className="text-xs font-black text-white">
              Distribucion por categoria
            </p>
            <div className="mt-5 grid place-items-center">
              <div className="grid size-28 place-items-center rounded-full border-[14px] border-vk-aqua/30 bg-[conic-gradient(from_130deg,rgba(31,216,169,0.85),rgba(25,107,255,0.85),rgba(178,132,255,0.8),rgba(63,240,128,0.85),rgba(31,216,169,0.85))]">
                <div className="grid size-16 place-items-center rounded-full bg-vk-navy-2 text-xl font-black text-white">
                  -
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-[#BFD0F4]">{category}</span>
                  <span className="font-black text-white">-</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-white/10 bg-white/7 p-4">
          <p className="text-xs font-black text-white">Procesos automatizados</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {processItems.map((item) => (
              <div key={item} className="border border-white/10 bg-vk-navy/30 p-3">
                <p className="text-xs font-black text-white">{item}</p>
                <p className="mt-2 text-xs font-semibold text-vk-aqua">Pendiente</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
