import { createClient } from '@supabase/supabase-js'

/**
 * Cliente minimo de Supabase usado UNICAMENTE para el flujo de magic link:
 * `auth.signInWithOtp()` (enviar el correo) y `auth.verifyOtp()` /
 * `auth.signOut()` en el callback (verificar el token, cerrar la sesion de
 * Supabase tras rechazar a un no autorizado).
 *
 * Deliberadamente NO se usa para sesiones, storage, realtime ni nada mas: la
 * sesion del portal la crea exclusivamente src/lib/session.ts (cookie propia
 * firmada con HMAC). Supabase Auth aqui es solo el servicio que envia el
 * correo y valida el codigo de un solo uso — el mismo desacople deliberado
 * que ya existe entre Google Calendar OAuth y la identidad del portal.
 *
 * Se desactiva persistSession/autoRefreshToken/detectSessionInUrl porque no
 * hay storage de cliente al que atar nada: cada llamada (Server Action o
 * Route Handler) crea su propia instancia de corta vida.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabaseAuth = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
