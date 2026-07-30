import 'server-only'
import { Resend } from 'resend'

/**
 * Destino fijo de las solicitudes del formulario publico de contacto.
 * No configurable por variable de entorno: es una decision de negocio
 * (a quien le llegan los leads), no un parametro de despliegue.
 */
const CONTACT_DESTINATION = 'vektriumassociate@gmail.com'

/**
 * Remitente de pruebas de Resend. No requiere verificar un dominio propio
 * para empezar a enviar. Cuando VEKTRIUM tenga un dominio de correo propio
 * verificado en Resend, cambiar esto a algo como
 * "Diagnostico VEKTRIUM <contacto@vektrium.pe>".
 */
const FROM_ADDRESS = 'VEKTRIUM <onboarding@resend.dev>'

export interface ContactRequest {
  nombre: string
  contacto: string
  area: string
  necesidad: string
}

export type SendContactResult = { ok: true } | { ok: false; reason: string }

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/**
 * Envia la solicitud del formulario de /contacto por correo. No persiste
 * nada: el unico registro de la solicitud es el correo mismo. Si en algun
 * momento se necesita historial buscable, se agrega una tabla `leads`
 * (esquema y RLS ya existen para clientes/oportunidades; el patron es
 * identico) sin romper esta funcion, que seguiria enviando el aviso.
 */
export async function sendContactRequest(input: ContactRequest): Promise<SendContactResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY no esta configurada' }
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: CONTACT_DESTINATION,
    // exactOptionalPropertyTypes no admite { replyTo: undefined } — se omite
    // la clave por completo cuando el contacto no parece un correo.
    ...(input.contacto.includes('@') ? { replyTo: input.contacto } : {}),
    subject: `Nueva solicitud de diagnostico — ${input.area}`,
    html: `
      <h2>Nueva solicitud desde /contacto</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(input.nombre)}</p>
      <p><strong>Correo o telefono:</strong> ${escapeHtml(input.contacto)}</p>
      <p><strong>Area:</strong> ${escapeHtml(input.area)}</p>
      <p><strong>Necesidad:</strong></p>
      <p>${escapeHtml(input.necesidad).replaceAll('\n', '<br>')}</p>
    `,
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  return { ok: true }
}
