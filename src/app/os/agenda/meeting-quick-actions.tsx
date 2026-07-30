'use client'

import { useActionState, useState } from 'react'
import { initialSimpleActionState } from './action-state'
import { updateMeetingLinkAction, updateMeetingNotesAction } from './actions'

/**
 * Copia el enlace de Meet al portapapeles. Es lo unico de esta pantalla que
 * necesita JS del navegador (Clipboard API); todo lo demas sigue siendo
 * formularios de servidor progresivamente mejorables.
 */
export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard API puede fallar sin HTTPS o sin permiso: el enlace
          // sigue visible y seleccionable a mano, no es un fallo bloqueante.
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-vk-line px-2.5 py-1 text-xs font-extrabold text-vk-navy transition hover:bg-vk-ice"
    >
      {copied ? 'Copiado ✓' : 'Copiar enlace'}
    </button>
  )
}

/**
 * Pega el enlace real de una reunion programada a mano en Google Meet. Vive
 * colapsado por defecto en un <details> para no ensuciar la tarjeta cuando
 * ya hay un enlace real guardado.
 */
export function MeetingLinkEditor({ meetingId, currentUrl }: { meetingId: string; currentUrl: string | null }) {
  const [state, formAction, pending] = useActionState(updateMeetingLinkAction, initialSimpleActionState)

  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer font-bold text-vk-cobalt hover:text-vk-navy">
        {currentUrl ? 'Cambiar enlace de Meet' : 'Pegar enlace real de Meet'}
      </summary>
      <form action={formAction} className="mt-2 flex flex-wrap items-start gap-2">
        <input type="hidden" name="meetingId" value={meetingId} />
        <div className="flex-1 min-w-[240px]">
          <label htmlFor={`meet-url-${meetingId}`} className="sr-only">
            Enlace de Google Meet
          </label>
          <input
            id={`meet-url-${meetingId}`}
            name="meetUrl"
            type="url"
            required
            placeholder="https://meet.google.com/abc-defg-hij"
            defaultValue={currentUrl ?? ''}
            className="w-full rounded-md border border-vk-line px-3 py-1.5 text-sm text-vk-ink"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-vk-cobalt px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar enlace'}
        </button>
      </form>
      {state.status === 'error' ? (
        <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
          {state.error}
        </p>
      ) : null}
      {state.status === 'success' ? (
        <p role="status" className="mt-1 text-xs font-semibold text-vk-success">
          Enlace guardado.
        </p>
      ) : null}
    </details>
  )
}

/** Notas rapidas de lo que pide el cliente. Sin version ni aprobacion: la ultima escritura gana. */
export function MeetingNotesEditor({ meetingId, currentNotes }: { meetingId: string; currentNotes: string | null }) {
  const [state, formAction, pending] = useActionState(updateMeetingNotesAction, initialSimpleActionState)

  return (
    <details className="mt-3 text-sm" open={Boolean(currentNotes)}>
      <summary className="cursor-pointer font-bold text-vk-cobalt hover:text-vk-navy">
        {currentNotes ? 'Notas de la reunión' : 'Agregar notas de la reunión'}
      </summary>
      <form action={formAction} className="mt-2 space-y-2">
        <input type="hidden" name="meetingId" value={meetingId} />
        <label htmlFor={`meet-notes-${meetingId}`} className="sr-only">
          Notas de la reunión
        </label>
        <textarea
          id={`meet-notes-${meetingId}`}
          name="notes"
          rows={3}
          maxLength={4000}
          placeholder="¿Qué pidió el cliente? ¿Qué se acordó?"
          defaultValue={currentNotes ?? ''}
          className="w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-vk-cobalt px-3 py-1.5 text-xs font-extrabold text-vk-cobalt transition hover:bg-vk-cobalt hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar notas'}
        </button>
        {state.status === 'error' ? (
          <p role="alert" className="text-xs font-semibold text-vk-danger">
            {state.error}
          </p>
        ) : null}
        {state.status === 'success' ? (
          <p role="status" className="text-xs font-semibold text-vk-success">
            Notas guardadas.
          </p>
        ) : null}
      </form>
    </details>
  )
}
