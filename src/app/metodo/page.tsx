import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'
import { methodSteps } from '@/site/content'

export const metadata: Metadata = {
  title: 'Metodo V.E.K.T.O.R.',
  description:
    'Metodo V.E.K.T.O.R.: Ver, Establecer, Construir, Transformar, Operar y Revisar procesos digitales.',
}

export default function MethodPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Metodo V.E.K.T.O.R."
          title="Un metodo para convertir friccion operativa en producto medible."
          copy="El recorrido evita soluciones sueltas: cada fase produce evidencia, responsables y criterios para decidir si conviene avanzar."
          actions={
            <>
              <PrimaryLink href="/contacto">Probar con mi primer reporte</PrimaryLink>
              <SecondaryLink href="/paquetes">Ver paquetes</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {methodSteps.map((step) => (
              <article key={step.letter} className="border border-vk-line bg-white p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-vk-lime text-sm font-black text-vk-navy">
                  {step.letter}
                </span>
                <h2 className="mt-5 font-display text-2xl font-extrabold text-vk-navy">{step.title}</h2>
                <p className="mt-4 text-sm leading-7 text-vk-muted">{step.copy}</p>
                <div className="mt-6 border-t border-vk-line pt-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-vk-cobalt">
                    Evidencia
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-vk-ink">{step.output}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-vk-line bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
            <SectionIntro
              eyebrow="Control"
              title="El metodo tambien protege contra entregas bonitas pero fragiles."
              copy="La adopcion, los permisos, la documentacion y la medicion se piensan desde el inicio, incluso en el primer reporte sin adelanto."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Sin metricas inventadas: se separa linea base real de dato ilustrativo.',
                'Sin dependencia invisible: el flujo queda documentado.',
                'Sin promesas absolutas: cada avance tiene criterio de aceptacion.',
                'Sin adelanto en el primer reporte: pagas cuando se presenta terminado.',
                'Sin fuga de informacion: visibilidad y autorizacion se definen antes de publicar.',
              ].map((control) => (
                <article key={control} className="border border-vk-line bg-vk-ice p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{control}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
