import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Politica de privacidad',
  description: 'Politica de privacidad de VEKTRIUM: que datos recopilamos y como los usamos.',
}

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Privacidad"
          title="Politica de privacidad de VEKTRIUM."
          copy="Como tratamos los datos que nos compartes al escribirnos o completar un formulario en este sitio."
          actions={
            <>
              <PrimaryLink href="/contacto">Agendar primer reporte</PrimaryLink>
              <SecondaryLink href="/terminos">Ver terminos</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <LegalBlock title="Datos que podemos solicitar">
            Nombre, datos de contacto, empresa, area, necesidad operativa y cualquier informacion que
            el visitante decida enviar por formulario.
          </LegalBlock>
          <LegalBlock title="Uso de la informacion">
            La informacion se usa para responder solicitudes, preparar la consulta gratuita, definir
            el alcance inicial, coordinar reuniones y dar seguimiento comercial relacionado con
            VEKTRIUM.
          </LegalBlock>
          <LegalBlock title="Datos sensibles y confidenciales">
            El sitio publico no recibe informacion sensible, personal o confidencial de clientes.
            Cualquier material de proyecto requiere autorizacion antes de publicarse.
          </LegalBlock>
          <LegalBlock title="Analitica">
            No usamos herramientas de analitica de terceros que recojan contenido sensible. Cualquier
            medicion se limita a interacciones generales de navegacion, nunca a datos personales o
            confidenciales.
          </LegalBlock>
          <LegalBlock title="Derechos del titular">
            El visitante puede solicitar acceso, rectificacion o eliminacion de sus datos escribiendo
            a traves de nuestro{' '}
            <Link href="/contacto" className="font-bold text-vk-cobalt hover:text-vk-navy">
              canal de contacto
            </Link>
            .
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
