type PreviewMetric = {
  label: string
  value: string
  helper: string
}

type PreviewArea = {
  label: string
  value: string
}

type PreviewOwner = {
  name: string
  count: string
  helper: string
}

type PreviewItem = {
  label: string
  state: string
}

export type AutomationPreviewPanelProps = {
  title?: string
  subtitle?: string
  badge?: string
  metrics?: PreviewMetric[]
  areas?: PreviewArea[]
  owners?: PreviewOwner[]
  items?: PreviewItem[]
}

const defaultMetrics: PreviewMetric[] = [
  {
    label: 'Proyectos',
    value: '7',
    helper: 'Documentados',
  },
  {
    label: 'Imagenes',
    value: '8',
    helper: 'Pantallas disponibles',
  },
  {
    label: 'Fundadores',
    value: '2',
    helper: 'Responsables visibles',
  },
]

const defaultAreas: PreviewArea[] = [
  { label: 'People Analytics', value: 'API BUK + Power BI' },
  { label: 'Planillas', value: 'Control mensual' },
  { label: 'Finanzas', value: 'Reportes y conciliacion' },
  { label: 'Documentos', value: 'QR + Google Drive' },
]

const defaultOwners: PreviewOwner[] = [
  { name: 'Alvaro', count: '4', helper: 'soluciones' },
  { name: 'Juan Diego', count: '3', helper: 'soluciones' },
]

const defaultItems: PreviewItem[] = [
  { label: 'BUK Analytics', state: 'RR. HH.' },
  { label: 'Planillas', state: 'Payroll' },
  { label: 'ReportFlow', state: 'Finanzas' },
  { label: 'GlobalMatch', state: 'Conciliacion' },
]

export function AutomationPreviewPanel({
  title = 'Lo que ya construimos',
  subtitle = 'Estadistica real del portafolio VEKTRIUM',
  badge = 'Portafolio real',
  metrics = defaultMetrics,
  areas = defaultAreas,
  owners = defaultOwners,
  items = defaultItems,
}: AutomationPreviewPanelProps) {
  const visibleAreas = areas.slice(0, 4)
  const remainingAreas = Math.max(areas.length - visibleAreas.length, 0)
  const visibleItems = items.slice(0, 4)
  const remainingItems = Math.max(items.length - visibleItems.length, 0)

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
            {badge}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="border border-white/10 bg-white/7 p-4">
              <p className="text-xs font-bold text-[#BFD0F4]">{metric.label}</p>
              <p className="mt-3 font-display text-3xl font-black text-white">
                {metric.value}
              </p>
              <p className="mt-2 text-xs font-semibold text-vk-aqua">
                {metric.helper}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(190px,0.75fr)]">
          <div className="min-h-56 border border-white/10 bg-white/7 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black text-white">Frentes documentados</p>
              {remainingAreas > 0 ? (
                <span className="text-[11px] font-black text-vk-aqua">
                  +{remainingAreas} mas
                </span>
              ) : null}
            </div>
            <div className="relative mt-5 min-h-36 overflow-hidden border border-white/8 bg-vk-navy/30 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:100%_33%,20%_100%]" />
              <div className="relative space-y-3">
                {visibleAreas.map((area) => (
                  <div key={area.label} className="border-l-2 border-vk-aqua/70 pl-3">
                    <p className="text-xs font-black text-white">{area.label}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[#BFD0F4]">
                      {area.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-56 border border-white/10 bg-white/7 p-4">
            <p className="text-xs font-black text-white">Responsables</p>
            <div className="mt-5 space-y-3">
              {owners.map((owner) => (
                <div
                  key={owner.name}
                  className="border border-white/10 bg-vk-navy/30 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-white">
                      {owner.name}
                    </span>
                    <span className="text-lg font-black text-vk-lime">
                      {owner.count}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#BFD0F4]">
                    {owner.helper}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border border-white/10 bg-white/7 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black text-white">Muestras del portafolio</p>
            {remainingItems > 0 ? (
              <span className="text-[11px] font-black text-vk-aqua">
                +{remainingItems} en detalle
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {visibleItems.map((item) => (
              <div key={item.label} className="border border-white/10 bg-vk-navy/30 p-3">
                <p className="line-clamp-2 text-xs font-black text-white">
                  {item.label}
                </p>
                <p className="mt-2 text-xs font-semibold text-vk-aqua">
                  {item.state}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
