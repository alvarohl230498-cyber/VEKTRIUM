import type { Metadata } from 'next'
import {
  ContactBand,
  PageHero,
  PrimaryLink,
  PublicShell,
  SecondaryLink,
  SectionIntro,
} from '@/components/site/public-shell'

export const metadata: Metadata = {
  title: 'Agenda',
  description:
    'Agenda una primera conversacion para un Diagnostico Vektor sobre procesos, datos y automatizacion.',
}

export default function AgendaPage() {
  return (
    <PublicShell>
      <main>
        <PageHero
          eyebrow="Agenda"
          title="Reserva una conversacion enfocada en el proceso."
          copy="La primera sesion debe ubicar dolor, datos, usuarios, urgencia, riesgos y un siguiente paso posible."
          actions={
            <>
              <PrimaryLink href="/contacto">Enviar contexto</PrimaryLink>
              <SecondaryLink href="/servicios">Revisar servicios</SecondaryLink>
            </>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <SectionIntro
              eyebrow="Formato"
              title="Diagnostico breve, decisiones concretas."
              copy="Cuando conecten Google Calendar o el calendario corporativo, esta ruta puede convertirse en reserva automatica. Por ahora funciona como flujo publico de preagenda."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                '30 minutos para entender el proceso.',
                'Una persona responsable del dolor operativo.',
                'Ejemplos de reporte, flujo o tarea repetitiva.',
                'Decision sobre si conviene diagnostico, demo o propuesta.',
              ].map((item) => (
                <article key={item} className="border border-vk-line bg-white p-5">
                  <p className="text-sm font-bold leading-7 text-vk-navy">{item}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="border border-vk-line bg-white p-6">
            <h2 className="font-display text-2xl font-extrabold text-vk-navy">Horarios sugeridos</h2>
            <div className="mt-6 grid gap-3">
              {['Lunes a viernes', '09:00 - 12:00', '15:00 - 18:00'].map((slot) => (
                <div key={slot} className="rounded-md bg-vk-ice px-4 py-3 text-sm font-extrabold text-vk-navy">
                  {slot}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-vk-muted">
              La integracion automatica de calendario se activara cuando el proyecto tenga el canal
              oficial conectado.
            </p>
            <PrimaryLink href="/contacto">Solicitar horario</PrimaryLink>
          </aside>
        </section>

        <ContactBand />
      </main>
    </PublicShell>
  )
}
