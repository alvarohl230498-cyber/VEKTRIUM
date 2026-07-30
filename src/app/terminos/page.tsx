import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Terminos',
  description: 'Terminos de uso del sitio publico de VEKTRIUM.',
}

export default function TermsPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Terminos"
          title="Terminos de uso de VEKTRIUM."
          copy="Las condiciones que aplican al usar este sitio y solicitar un diagnostico."
          actions={
            <>
              <PrimaryLink href="/contacto">Contactar</PrimaryLink>
              <SecondaryLink href="/privacidad">Ver privacidad</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <LegalBlock title="Uso del sitio">
            El sitio presenta servicios, metodo, proyectos, recursos y canales de contacto de
            VEKTRIUM. No reemplaza una propuesta comercial ni un contrato.
          </LegalBlock>
          <LegalBlock title="Contenido de proyectos">
            Los casos reales requieren autorizacion. Las demos usan datos ficticios y cualquier cifra
            ilustrativa debe estar etiquetada.
          </LegalBlock>
          <LegalBlock title="Alcance de servicios">
            Los paquetes Start, Scale y Partner describen formas de trabajo. Precios, fechas y
            entregables finales se definen por cotizacion y diagnostico.
          </LegalBlock>
          <LegalBlock title="Propiedad intelectual">
            Los textos, estructura, demos y recursos del sitio pertenecen a VEKTRIUM o se usan con
            autorizacion. No deben copiarse sin permiso.
          </LegalBlock>
          <LegalBlock title="Cambios">
            VEKTRIUM puede actualizar contenido, recursos o enlaces cuando el proyecto evolucione o se
            validen nuevos materiales.
          </LegalBlock>
          <LegalBlock title="Sin asesoria legal">
            Este contenido informa las condiciones de uso del sitio y no debe considerarse asesoria
            legal. Para consultas especificas, escribenos por el canal de contacto.
          </LegalBlock>
        </section>
      </main>
    </PublicShell>
  )
}

function LegalBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="border-t border-vk-line py-6 first:border-t-0">
      <h2 className="font-display text-2xl font-extrabold text-vk-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-vk-muted">{children}</p>
    </article>
  )
}
