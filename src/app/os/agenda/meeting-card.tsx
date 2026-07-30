import type { Client, Meeting, Project, User } from '@/data'
import { IllustrativeBadge, SimulatedBadge } from '@/components/os/illustrative-badge'
import { MEETING_SYNC_LABELS, MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { retryMeetingSyncAction } from './actions'
import { CopyLinkButton, MeetingLinkEditor, MeetingNotesEditor } from './meeting-quick-actions'

const SYNC_DOT: Record<Meeting['syncStatus'], string> = {
  pendiente: 'bg-vk-warning',
  sincronizada: 'bg-vk-success',
  fallida: 'bg-vk-danger',
}

const SYNC_TEXT: Record<Meeting['syncStatus'], string> = {
  pendiente: 'text-vk-warning',
  sincronizada: 'text-vk-success',
  fallida: 'text-vk-danger',
}

export function MeetingCard({
  meeting,
  client,
  project,
  organizer,
  isPast,
}: {
  meeting: Meeting
  client: Client | undefined
  project: Project | undefined
  organizer: User | undefined
  isPast: boolean
}) {
  return (
    <li
      className={`border border-vk-line bg-white p-4 ${isPast ? 'opacity-70' : ''}`}
      aria-label={isPast ? 'Reunión pasada' : 'Reunión próxima'}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-cobalt">
            {formatLimaTime(new Date(meeting.startsAt))}–{formatLimaTime(new Date(meeting.endsAt))} · hora de Lima
          </p>
          <p className="mt-1 font-display text-lg font-extrabold text-vk-navy">{meeting.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPast ? (
            <span className="inline-flex items-center rounded-md bg-vk-ice px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-vk-muted">
              Pasada
            </span>
          ) : null}
          {meeting.isIllustrative ? <IllustrativeBadge /> : null}
          {meeting.isMock ? <SimulatedBadge /> : null}
        </div>
      </div>

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm text-vk-muted sm:grid-cols-2">
        <div>
          <dt className="inline font-bold text-vk-ink">Tipo: </dt>
          <dd className="inline">{MEETING_TYPE_LABELS[meeting.type]}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-vk-ink">Cliente: </dt>
          <dd className="inline">{client?.tradeName ?? 'Cliente desconocido'}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-vk-ink">Proyecto: </dt>
          <dd className="inline">{project ? `${project.code} · ${project.name}` : 'Sin proyecto vinculado'}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-vk-ink">Organizador: </dt>
          <dd className="inline">{organizer?.fullName ?? 'Desconocido'}</dd>
        </div>
      </dl>

      {meeting.agenda ? <p className="mt-2 text-sm leading-6 text-vk-muted">{meeting.agenda}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em]">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${SYNC_DOT[meeting.syncStatus]}`} />
          <span className={SYNC_TEXT[meeting.syncStatus]}>Sincronización: {MEETING_SYNC_LABELS[meeting.syncStatus]}</span>
        </span>

        {meeting.meetUrl ? (
          <>
            <a
              href={meeting.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-vk-cobalt hover:text-vk-navy"
            >
              Unirse a Meet {meeting.isMock ? <SimulatedBadge /> : null}
            </a>
            <CopyLinkButton url={meeting.meetUrl} />
          </>
        ) : null}

        {meeting.syncStatus === 'fallida' ? (
          <form action={retryMeetingSyncAction.bind(null, meeting.id)}>
            <button
              type="submit"
              className="rounded-md border border-vk-danger px-3 py-1.5 text-xs font-extrabold text-vk-danger transition hover:bg-vk-danger/10"
            >
              Reintentar sincronización
            </button>
          </form>
        ) : null}
      </div>

      {meeting.syncStatus === 'fallida' && meeting.syncError ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-vk-danger">
          {meeting.syncError}
        </p>
      ) : null}

      <MeetingLinkEditor meetingId={meeting.id} currentUrl={meeting.isMock ? null : meeting.meetUrl} />
      <MeetingNotesEditor meetingId={meeting.id} currentNotes={meeting.notes} />
    </li>
  )
}
