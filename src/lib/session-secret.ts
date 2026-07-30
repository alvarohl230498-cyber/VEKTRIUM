/**
 * Resolucion del secreto con el que se firma el cookie de sesion.
 *
 * Vive aparte de session.ts para poder probarse sin `next/headers`, igual que
 * dev-auth.ts. Es logica pura sin secretos propios.
 *
 * El valor de respaldo esta escrito en el codigo fuente y por tanto es publico:
 * cualquiera con acceso al repositorio podria firmar una cookie valida. Por eso
 * solo sirve fuera de produccion. En produccion sin SESSION_SECRET no hay
 * secreto en absoluto, de modo que ninguna cookie verifica y el portal redirige
 * a /login en vez de aceptar una sesion falsificada.
 */
export const INSECURE_DEV_SECRET = 'vektrium-dev-insecure-secret-configura-SESSION_SECRET'

export function getSessionSecret(): string | null {
  const configured = process.env.SESSION_SECRET
  if (configured) return configured
  return process.env.NODE_ENV === 'production' ? null : INSECURE_DEV_SECRET
}
