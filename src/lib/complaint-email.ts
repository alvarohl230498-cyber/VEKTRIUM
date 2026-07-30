import 'server-only'
import { Resend } from 'resend'

/**
 * Mismo destino y remitente que src/lib/contact-email.ts: un solo canal de
 * llegada para leads y reclamos hasta que exista una bandeja dedicada.
 */
const COMPLAINT_DESTINATION = 'vektriumassociate@gmail.com'
const FROM_ADDRESS = 'VEKTRIUM <onboarding@resend.dev>'

export interface ComplaintRequest {
  nombre: string
  documento: string
  tipo: string
  detalle: string
}

export type SendComplaintResult = { ok: true } | { ok: false; reason: string }

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/**
 * Envia el registro del libro de reclamaciones por correo. Mismo patron que
 * sendContactRequest: no persiste nada, el correo es el unico registro.
 */
export async function sendComplaintRequest(input: ComplaintRequest): Promise<SendComplaintResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY no esta configurada' }
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: COMPLAINT_DESTINATION,
    subject: `Nuevo registro en el libro de reclamaciones — ${input.tipo}`,
    html: `
      <h2>Nuevo registro desde /libro-reclamaciones</h2>
      <p><strong>Nombre completo:</strong> ${escapeHtml(input.nombre)}</p>
      <p><strong>Documento:</strong> ${escapeHtml(input.documento || 'No indicado')}</p>
      <p><strong>Tipo:</strong> ${escapeHtml(input.tipo)}</p>
      <p><strong>Detalle:</strong></p>
      <p>${escapeHtml(input.detalle).replaceAll('\n', '<br>')}</p>
    `,
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  return { ok: true }
}
