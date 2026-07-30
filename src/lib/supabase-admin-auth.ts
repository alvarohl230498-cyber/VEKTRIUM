import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con service_role para operaciones del SDK de Auth que
 * exigen privilegios de administrador. Dos usos, ambos deliberadamente
 * angostos:
 *
 * 1. auth.admin.generateLink() desde requestMagicLink() (src/app/login/
 *    actions.ts). El SMTP de Supabase (relay via smtp.resend.com) rechaza el
 *    envio con remitente onboarding@resend.dev — Resend solo permite ese
 *    remitente de pruebas a traves de su API REST, no via SMTP crudo. La app
 *    genera el enlace ella misma y lo envia por su propia integracion de
 *    Resend (src/lib/magic-link-email.ts). Supabase nunca envia el correo.
 *
 * 2. auth.admin.updateUserById(id, {password}) desde src/app/os/perfil/
 *    actions.ts, para que un usuario fije su propia contraseña. No hace
 *    falta un flujo de "contraseña actual" porque quien llama ya paso
 *    requireSession() (nuestra propia cookie firmada, no una sesion de
 *    Supabase): la identidad ya esta verificada antes de llegar aqui.
 *
 * Es una segunda instancia de service_role, distinta de src/db/admin (esa es
 * Drizzle/Postgres; esta es el SDK de Auth). Mismo principio de aislamiento:
 * solo se importa desde estos dos Server Actions, nunca desde codigo que
 * simplemente atienda una peticion ya autenticada.
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
