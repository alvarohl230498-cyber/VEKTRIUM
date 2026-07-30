import { describe, expect, it } from 'vitest'
import { meetingFormSchema, meetingLinkSchema } from '@/lib/schemas/meeting'

const validBase = {
  clientId: 'client-1',
  projectId: '',
  type: 'contacto_inicial',
  title: 'Reunion de prueba',
  organizerId: 'user-1',
  date: '2026-08-15',
  startTime: '10:00',
  durationMinutes: '30',
  customDurationMinutes: '',
  attendeeKeys: [] as string[],
  agenda: 'Agenda de prueba con suficientes caracteres.',
  requestId: 'req-1',
  confirmConflict: '',
}

describe('meetingFormSchema — meetUrl', () => {
  it('acepta el campo vacio (sin enlace)', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: '' })
    expect(result.success).toBe(true)
  })

  it('acepta una URL valida', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'https://meet.google.com/abc-defg-hij' })
    expect(result.success).toBe(true)
  })

  it('rechaza un texto que no es una URL', () => {
    const result = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'no es un enlace' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'meetUrl')
      expect(issue?.message).toBe('Pega un enlace valido, por ejemplo https://meet.google.com/abc-defg-hij')
    }
  })

  it('ya no acepta createMeet: el campo no existe en el esquema', () => {
    const parsed = meetingFormSchema.parse({ ...validBase, meetUrl: '' })
    expect(parsed).not.toHaveProperty('createMeet')
  })
})

describe('meetingLinkSchema comparte el mismo mensaje de error', () => {
  it('usa el mismo texto que meetingFormSchema para una URL invalida', () => {
    const linkResult = meetingLinkSchema.safeParse({ meetingId: 'm-1', meetUrl: 'no es un enlace' })
    const formResult = meetingFormSchema.safeParse({ ...validBase, meetUrl: 'no es un enlace' })
    const linkMessage = !linkResult.success ? linkResult.error.issues[0]?.message : null
    const formMessage = !formResult.success
      ? formResult.error.issues.find((i) => i.path[0] === 'meetUrl')?.message
      : null
    expect(linkMessage).toBe(formMessage)
  })
})
