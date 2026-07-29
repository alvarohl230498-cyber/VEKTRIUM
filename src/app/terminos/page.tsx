import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Terminos',
  description: 'Borrador de terminos de uso para el sitio publico de VEKTRIUM.',
}

export default function TermsPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Terminos"
          title="Terminos de uso listos para revision."
          copy="La pagina existe para que el sitio tenga enlace legal completo. El texto final debe validarse antes de publicarse."
          actions={
            <>
              <PrimaryLink href="/contacto">Contactar</PrimaryLink>
              <SecondaryLink href="/privacidad">Ver privacidad</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <LegalBlock
            title="Uso del sitio"
            copy="El sitio presenta servicios, metodo, proyectos, recursos y canales de contacto de VEKTRIUM. No reemplaza una propuesta comercial ni un contrato."
          />
          <LegalBlock
            title="Contenido de proyectos"
            copy="Los casos reales requieren autorizacion. Las demos usan datos ficticios y cualquier cifra ilustrativa debe estar etiquetada."
          />
          <LegalBlock
            title="Alcance de servicios"
            copy="Los paquetes Start, Scale y Partner describen formas de trabajo. Precios, fechas y entregables finales se definen por cotizacion y diagnostico."
          />
          <LegalBlock
            title="Propiedad intelectual"
            copy="Los textos, estructura, demos y recursos del sitio pertenecen a VEKTRIUM o se usan con autorizacion. No deben copiarse sin permiso."
          />
          <LegalBlock
            title="Cambios"
            copy="VEKTRIUM puede actualizar contenido, recursos o enlaces cuando el proyecto evolucione o se validen nuevos materiales."
          />
          <SectionIntro
            eyebrow="Pendiente"
            title="Antes de produccion falta revision legal final."
            copy="Este borrador evita enlaces vacios, pero no debe considerarse asesoria legal."
          />
        </section>
      </main>
    </PublicShell>
  )
}

function LegalBlock({ copy, title }: { copy: string; title: string }) {
  return (
    <article className="border-t border-vk-line py-6 first:border-t-0">
      <h2 className="font-display text-2xl font-extrabold text-vk-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-vk-muted">{copy}</p>
    </article>
  )
}
