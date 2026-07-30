import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { proofVisibility, resources } from '@/site/content'

export const metadata: Metadata = {
  title: 'Vektrium Proof',
  description:
    'Vektrium Proof: zona de evidencia publica y privada con control de visibilidad por proyecto.',
}

export default function VektriumProofPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Vektrium Proof"
          title="Evidencia publica y material privado, separados con cuidado."
          copy="La zona Proof muestra demos abiertas y prepara material autenticado para miembros, clientes especificos o fundadores, sin publicar datos confidenciales."
          actions={
            <>
              <PrimaryLink href="/proyectos">Ver demos publicas</PrimaryLink>
              <SecondaryLink href="/contacto?motivo=vek-proof">Agendar primer reporte</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-4">
            {proofVisibility.map((visibility) => (
              <article key={visibility} className="border border-vk-line bg-white p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                  Visibilidad
                </p>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-vk-navy">
                  {visibility}
                </h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">
                  {visibilityCopy(visibility)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Contenido"
              title="Que entra en Proof y que queda fuera."
              copy="La separacion evita que una visita publica encuentre material operativo interno o informacion de clientes."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {resources.map((resource) => (
                <article key={resource.title} className="border border-vk-line bg-vk-ice p-5">
                  <h2 className="font-display text-xl font-extrabold text-vk-navy">{resource.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-vk-muted">{resource.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="border border-vk-line bg-white p-6">
            <SectionIntro
              eyebrow="Regla de seguridad"
              title="Nada confidencial se publica sin autorizacion explicita."
              copy="Cuando un material sea para cliente, miembro o fundador, debe vivir detras de autenticacion y permisos. El portal privado no se enlaza desde el sitio publico."
            />
          </div>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}

function visibilityCopy(visibility: (typeof proofVisibility)[number]) {
  switch (visibility) {
    case 'Publico':
      return 'Demos, prototipos o materiales que pueden compartirse sin datos sensibles.'
    case 'Miembros':
      return 'Material para usuarios autorizados que necesitan mas detalle que una visita publica.'
    case 'Cliente especifico':
      return 'Evidencia visible solo para el cliente relacionado y usuarios aprobados.'
    case 'Solo fundadores':
      return 'Material interno de decision, revision o control que no se expone fuera del equipo.'
  }
}
