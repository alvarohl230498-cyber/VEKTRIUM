'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useActionState } from 'react'
import type { Client, Contact, Project, User } from '@/data'
import { MEETING_TYPES } from '@/data/types'
import { DURATION_PRESETS_MINUTES, MEETING_TYPE_LABELS, formatLimaTime } from '@/lib/agenda'
import { initialMeetingActionState } from './action-state'
import { createMeetingAction } from './actions'

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-vk-danger">
      {message}
    </p>
  )
}

export function NewMeetingForm({
  clients,
  projects,
  users,
  contacts,
  requestId,
}: {
  clients: Client[]
  projects: Project[]
  users: User[]
  contacts: Contact[]
  requestId: string
}) {
  const [state, formAction, pending] = useActionState(createMeetingAction, initialMeetingActionState)
  const formRef = useRef<HTMLFormElement>(null)
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [duration, setDuration] = useState<string>('30')
  const formId = useId()

  useEffect(() => {
    if (state.status === 'success') {
      // Reset imperativo del DOM del formulario tras guardar. clientId/duration
      // son solo estado de filtrado en pantalla (no controlan el valor
      // enviado salvo `duration`, que el usuario vuelve a fijar en el
      // siguiente uso); no hace falta sincronizarlos aqui.
      formRef.current?.reset()
    }
  }, [state.status])

  const clientProjects = projects.filter((p) => p.clientId === clientId)
  const clientContacts = contacts.filter((c) => c.clientId === clientId)

  return (
    <section aria-labelledby={`${formId}-heading`} className="border border-vk-line bg-white p-6">
      <h2 id={`${formId}-heading`} className="font-display text-2xl font-extrabold text-vk-navy">
        Nueva reunión
      </h2>
      <p className="mt-1 text-sm leading-6 text-vk-muted">
        Todas las horas se guardan y muestran en zona horaria de Lima (UTC-5).
      </p>

      {state.status === 'success' ? (
        <p role="status" className="mt-4 rounded-md border border-vk-success/30 bg-vk-success/10 px-4 py-3 text-sm font-semibold text-vk-success">
          Reunión guardada correctamente.
        </p>
      ) : null}

      {state.formError ? (
        <p role="alert" className="mt-4 rounded-md border border-vk-danger/30 bg-vk-danger/10 px-4 py-3 text-sm font-semibold text-vk-danger">
          {state.formError}
        </p>
      ) : null}

      {state.status === 'conflict' ? (
        <div role="alert" className="mt-4 rounded-md border border-vk-warning/30 bg-vk-warning/10 px-4 py-3 text-sm text-vk-navy">
          <p className="font-extrabold text-vk-warning">Conflicto de horario</p>
          <p className="mt-1 leading-6">
            El organizador elegido ya tiene {state.conflicts.length === 1 ? 'una reunión' : 'reuniones'} en ese
            horario. Puedes guardar de todas formas si es intencional.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.conflicts.map((c) => (
              <li key={c.id}>
                {c.title} · {formatLimaTime(new Date(c.startsAt))}–{formatLimaTime(new Date(c.endsAt))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form ref={formRef} action={formAction} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
        <input type="hidden" name="requestId" defaultValue={requestId} />

        <div>
          <label htmlFor={`${formId}-clientId`} className="text-sm font-bold text-vk-navy">
            Cliente <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-clientId`}
            name="clientId"
            required
            defaultValue={clients[0]?.id ?? ''}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {clients.length === 0 ? <option value="">No hay clientes registrados</option> : null}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradeName ?? c.legalName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.clientId} />
        </div>

        <div>
          <label htmlFor={`${formId}-projectId`} className="text-sm font-bold text-vk-navy">
            Proyecto (opcional)
          </label>
          <select
            id={`${formId}-projectId`}
            name="projectId"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            <option value="">Sin proyecto vinculado</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.projectId} />
        </div>

        <div>
          <label htmlFor={`${formId}-type`} className="text-sm font-bold text-vk-navy">
            Tipo de reunión <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-type`}
            name="type"
            required
            defaultValue={MEETING_TYPES[0]}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {MEETING_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.type} />
        </div>

        <div>
          <label htmlFor={`${formId}-title`} className="text-sm font-bold text-vk-navy">
            Título <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            required
            maxLength={140}
            placeholder="Ej. Levantamiento de proceso de facturación"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.title} />
        </div>

        <div>
          <label htmlFor={`${formId}-organizerId`} className="text-sm font-bold text-vk-navy">
            Organizador <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-organizerId`}
            name="organizerId"
            required
            defaultValue={users[0]?.id ?? ''}
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
          <FieldError message={state.fieldErrors.organizerId} />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:col-span-1">
          <div className="col-span-2">
            <label htmlFor={`${formId}-date`} className="text-sm font-bold text-vk-navy">
              Fecha <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-date`}
              name="date"
              type="date"
              required
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.date} />
          </div>
          <div>
            <label htmlFor={`${formId}-startTime`} className="text-sm font-bold text-vk-navy">
              Hora <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-startTime`}
              name="startTime"
              type="time"
              required
              className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            />
            <FieldError message={state.fieldErrors.startTime} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <span className="text-sm font-bold text-vk-navy">Duración</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <select
              aria-label="Duración de la reunión"
              name="durationMinutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
            >
              {DURATION_PRESETS_MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m} minutos
                </option>
              ))}
              <option value="custom">Personalizada</option>
            </select>
            {duration === 'custom' ? (
              <div>
                <label htmlFor={`${formId}-customDuration`} className="sr-only">
                  Duración personalizada en minutos
                </label>
                <input
                  id={`${formId}-customDuration`}
                  name="customDurationMinutes"
                  type="number"
                  min={5}
                  max={480}
                  placeholder="Minutos"
                  className="w-28 rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
                />
              </div>
            ) : (
              <input type="hidden" name="customDurationMinutes" value="" />
            )}
          </div>
          <FieldError message={state.fieldErrors.customDurationMinutes} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-bold text-vk-navy">Asistentes</legend>
          <p className="text-xs text-vk-muted">El organizador se agrega automáticamente.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Equipo VEKTRIUM</p>
              {users.map((u) => (
                <label key={u.id} className="mt-1 flex items-center gap-2 text-sm text-vk-ink">
                  <input type="checkbox" name="attendeeKeys" value={`user:${u.id}`} className="h-4 w-4" />
                  {u.fullName}
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">Contactos del cliente</p>
              {clientContacts.length === 0 ? (
                <p className="mt-1 text-xs text-vk-muted">Este cliente no tiene contactos registrados.</p>
              ) : (
                clientContacts.map((c) => (
                  <label key={c.id} className="mt-1 flex items-center gap-2 text-sm text-vk-ink">
                    <input type="checkbox" name="attendeeKeys" value={`contact:${c.id}`} className="h-4 w-4" />
                    {c.fullName}
                  </label>
                ))
              )}
            </div>
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-agenda`} className="text-sm font-bold text-vk-navy">
            Agenda / objetivos <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-agenda`}
            name="agenda"
            required
            rows={3}
            maxLength={2000}
            placeholder="¿Qué se espera lograr en esta reunión?"
            className="mt-1 w-full rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
          <FieldError message={state.fieldErrors.agenda} />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-bold text-vk-navy">
            <input type="checkbox" name="createMeet" defaultChecked className="h-4 w-4" />
            Crear videollamada (Meet simulado)
          </label>
          <p className="mt-1 text-xs text-vk-muted">
            No hay credenciales de Google conectadas: el enlace se genera con un proveedor simulado, marcado
            siempre con la insignia SIMULADO.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-vk-cobalt px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-vk-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar reunión'}
          </button>
          {state.status === 'conflict' ? (
            <button
              type="submit"
              name="confirmConflict"
              value="true"
              disabled={pending}
              className="rounded-md border border-vk-warning px-5 py-2.5 text-sm font-extrabold text-vk-warning transition hover:bg-vk-warning/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar de todas formas
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
