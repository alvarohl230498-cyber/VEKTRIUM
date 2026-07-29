import type { Metadata } from 'next'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description: 'Borrador de politica de privacidad para el sitio publico de VEKTRIUM.',
}

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Privacidad"
          title="Politica de privacidad para validar antes de publicar."
          copy="Este texto deja preparada la pagina legal que pide el spec. Debe ser revisado por los fundadores antes de usarlo en produccion."
          actions={
            <>
              <PrimaryLink href="/contacto">Contactar</PrimaryLink>
              <SecondaryLink href="/terminos">Ver terminos</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <LegalBlock
            title="Datos que podemos solicitar"
            copy="Nombre, datos de contacto, empresa, area, necesidad operativa y cualquier informacion que el visitante decida enviar por formulario."
          />
          <LegalBlock
            title="Uso de la informacion"
            copy="La informacion se usa para responder solicitudes, preparar diagnosticos, coordinar reuniones y dar seguimiento comercial relacionado con VEKTRIUM."
          />
          <LegalBlock
            title="Datos sensibles y confidenciales"
            copy="El sitio publico no debe recibir informacion sensible, personal o confidencial de clientes. Cualquier material de proyecto requiere autorizacion antes de publicarse."
          />
          <LegalBlock
            title="Analitica"
            copy="El spec prohibe analitica de terceros que recoja contenido sensible. Si se agregan eventos, deben limitarse a interacciones no sensibles como hero_cta o booking_start."
          />
          <LegalBlock
            title="Derechos del titular"
            copy="El visitante puede solicitar acceso, rectificacion o eliminacion de sus datos mediante el canal de contacto oficial que los fundadores validen."
          />
          <SectionIntro
            eyebrow="Pendiente"
            title="Antes de produccion falta validar responsable legal, correo oficial y plazos."
            copy="La pagina esta implementada para que el enlace exista, pero el contenido legal final debe revisarse antes de publicar el sitio."
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
