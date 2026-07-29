import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Libro de reclamaciones',
  description: 'Canal preparado para libro de reclamaciones cuando corresponda.',
}

export default function ClaimsBookPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Libro de reclamaciones"
          title="Canal preparado para reclamos o quejas cuando corresponda."
          copy="El spec pide este enlace cuando aplique. La pagina queda implementada y pendiente de validacion legal y datos oficiales."
          actions={
            <>
              <PrimaryLink href="#formulario">Registrar comunicacion</PrimaryLink>
              <SecondaryLink href="/contacto">Ir a contacto</SecondaryLink>
            </>
          }
        />

        <section id="formulario" className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Informacion"
              title="La operacion final debe ajustarse a la obligacion aplicable."
              copy="Antes de produccion se deben confirmar razon social, RUC, domicilio, correo oficial, numeracion, plazos y responsable de atencion."
            />
            <div className="mt-8 border border-vk-line bg-white p-5">
              <h2 className="font-display text-2xl font-extrabold text-vk-navy">Estado de implementacion</h2>
              <p className="mt-3 text-sm leading-7 text-vk-muted">
                Pagina y enlace listos. Falta validacion legal y conexion a almacenamiento o mesa de
                atencion antes de recibir casos reales.
              </p>
            </div>
          </div>

          <form action="/libro-reclamaciones#formulario" method="get" className="space-y-4 border border-vk-line bg-white p-5">
            <label className="block">
              <span className="text-sm font-extrabold text-vk-navy">Nombre completo</span>
              <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="nombre" required />
            </label>
            <label className="block">
              <span className="text-sm font-extrabold text-vk-navy">Documento o identificacion</span>
              <input className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="documento" />
            </label>
            <label className="block">
              <span className="text-sm font-extrabold text-vk-navy">Tipo</span>
              <select className="mt-2 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="tipo" required>
                <option value="">Seleccionar</option>
                <option>Queja</option>
                <option>Reclamo</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-extrabold text-vk-navy">Detalle</span>
              <textarea className="mt-2 min-h-32 w-full rounded-md border border-vk-line px-3 py-3 text-sm outline-none focus:border-vk-cobalt" name="detalle" required />
            </label>
            <button className="w-full rounded-md bg-vk-cobalt px-4 py-3 text-sm font-extrabold text-white transition hover:bg-vk-navy" type="submit">
              Preparar registro
            </button>
          </form>
        </section>
      </main>
    </PublicShell>
  )
}
