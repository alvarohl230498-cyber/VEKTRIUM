import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con service_role, usado UNICAMENTE para
 * auth.admin.generateLink() desde requestMagicLink() (src/app/login/actions.ts).
 *
 * Por que existe: el SMTP de Supabase (relay via smtp.resend.com) rechaza el
 * envio con remitente onboarding@resend.dev — Resend solo permite ese
 * remitente de pruebas a traves de su API REST, no via SMTP crudo. En vez de
 * depender de un dominio verificado en Resend (que VEKTRIUM aun no tiene),
 * la app genera el enlace ella misma con generateLink() y lo envia por su
 * propia integracion de Resend (src/lib/contact-email.ts ya prueba que ese
 * camino funciona). Supabase nunca envia el correo en este flujo.
 *
 * Es una segunda instancia de service_role, distinta de src/db/admin (esa es
 * Drizzle/Postgres; esta es el SDK de Auth). Mismo principio de aislamiento:
 * solo se importa desde login/actions.ts, nunca desde codigo que atienda
 * peticiones ya autenticadas.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdminAuth = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
