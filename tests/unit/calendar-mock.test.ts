import { describe, expect, it } from 'vitest'
import { MockCalendarProvider } from '@/integrations/calendar/mock'
import type { CreateEventInput } from '@/integrations/calendar/provider'

function baseInput(overrides: Partial<CreateEventInput> = {}): CreateEventInput {
  return {
    requestId: 'req-1',
    title: 'Reunion de prueba',
    description: 'Agenda de prueba',
    startsAt: '2026-08-01T15:00:00.000Z',
    endsAt: '2026-08-01T16:00:00.000Z',
    organizerEmail: 'alvaro@vektrium.pe',
    attendeeEmails: ['cliente@empresa.pe'],
    ...overrides,
  }
}

describe('MockCalendarProvider', () => {
  it('marca todo evento creado como isMock: true', async () => {
    const provider = new MockCalendarProvider()
    const result = await provider.createEvent(baseInput())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.isMock).toBe(true)
      expect(result.value.meetUrl).toMatch(/^https:\/\/meet\.vektrium\.dev\/mock\//)
    }
  })

  it('genera identificadores de evento distintos para requestId distintos', async () => {
    const provider = new MockCalendarProvider()
    const a = await provider.createEvent(baseInput({ requestId: 'req-a' }))
    const b = await provider.createEvent(baseInput({ requestId: 'req-b' }))

    expect(a.ok && b.ok).toBe(true)
    if (a.ok && b.ok) {
      expect(a.value.providerEventId).not.toBe(b.value.providerEventId)
      expect(a.value.meetUrl).not.toBe(b.value.meetUrl)
    }
  })

  it('es idempotente: el mismo requestId devuelve SIEMPRE el mismo evento, nunca un duplicado', async () => {
    const provider = new MockCalendarProvider()
    const first = await provider.createEvent(baseInput({ requestId: 'req-idempotente' }))
    const second = await provider.createEvent(
      baseInput({ requestId: 'req-idempotente', title: 'Titulo cambiado en el reintento' }),
    )

    expect(first.ok && second.ok).toBe(true)
    if (first.ok && second.ok) {
      expect(second.value.providerEventId).toBe(first.value.providerEventId)
      expect(second.value.meetUrl).toBe(first.value.meetUrl)
    }
  })

  it('rechaza crear un evento sin requestId', async () => {
    const provider = new MockCalendarProvider()
    const result = await provider.createEvent(baseInput({ requestId: '' }))

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('SOLICITUD_INVALIDA')
  })

  it('cancelEvent elimina el evento y libera el requestId para un nuevo evento', async () => {
    const provider = new MockCalendarProvider()
    const created = await provider.createEvent(baseInput({ requestId: 'req-cancelable' }))
    expect(created.ok).toBe(true)
    if (!created.ok) return

    const cancelled = await provider.cancelEvent(created.value.providerEventId)
    expect(cancelled.ok).toBe(true)

    const recreated = await provider.createEvent(baseInput({ requestId: 'req-cancelable' }))
    expect(recreated.ok).toBe(true)
    if (recreated.ok) {
      expect(recreated.value.providerEventId).not.toBe(created.value.providerEventId)
    }
  })

  it('updateEvent y cancelEvent devuelven error si el evento no existe', async () => {
    const provider = new MockCalendarProvider()
    const updated = await provider.updateEvent('mock-evt-inexistente', { title: 'x' })
    const cancelled = await provider.cancelEvent('mock-evt-inexistente')

    expect(updated.ok).toBe(false)
    expect(cancelled.ok).toBe(false)
    if (!updated.ok) expect(updated.error.code).toBe('EVENTO_NO_ENCONTRADO')
  })
})
