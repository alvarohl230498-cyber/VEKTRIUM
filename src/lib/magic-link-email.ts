import 'server-only'
import { Resend } from 'resend'

/** Mismo remitente de pruebas que ya funciona para /contacto (via API REST de Resend). */
const FROM_ADDRESS = 'VEKTRIUM <onboarding@resend.dev>'

export type SendMagicLinkResult = { ok: true } | { ok: false; reason: string }

/**
 * Envia el enlace de ingreso por la API REST de Resend — no por SMTP. Existe
 * porque el SMTP de Supabase (via smtp.resend.com) rechaza enviar con
 * remitente onboarding@resend.dev: Resend solo permite ese remitente de
 * pruebas a traves de su API, no via SMTP crudo. La API si funciona con ese
 * remitente (verificado con el formulario de /contacto), asi que la app
 * genera el enlace con supabaseAdminAuth.auth.admin.generateLink() y lo
 * envia ella misma, sin que Supabase intervenga en el envio.
 */
export async function sendMagicLinkEmail(email: string, link: string): Promise<SendMagicLinkResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY no esta configurada' }
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Tu enlace de acceso a VEKTRIUM OS',
    html: `
      <h2>Tu enlace de acceso</h2>
      <p>Sigue este enlace para entrar a VEKTRIUM OS. Expira pronto y solo se puede usar una vez.</p>
      <p><a href="${link}">Ingresar</a></p>
    `,
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  return { ok: true }
}
