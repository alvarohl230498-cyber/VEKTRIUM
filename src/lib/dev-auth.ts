/**
 * Puerta de acceso de desarrollo: entrar al portal eligiendo directamente a
 * Juan Diego o a Alvaro, sin passwords ni OAuth, mientras no exista un
 * proyecto Supabase que sostenga "Continuar con Google".
 *
 * Critico de seguridad: esta puerta debe ser imposible en produccion. Vercel
 * fija NODE_ENV=production en cada despliegue, asi que basta con comprobarlo
 * en el servidor — nunca confiar en una variable que el cliente controle.
 *
 * `isDevSignInEnabled` es una funcion pura y exportada precisamente para que
 * se pueda probar sin invocar el Server Action ni next/headers: es el punto
 * exacto que decide si la puerta esta abierta o cerrada.
 */
export function isDevSignInEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export const DEV_SIGN_IN_USERS = [
  { id: 'user-juan-diego', label: 'Juan Diego Salazar Campos' },
  { id: 'user-alvaro', label: 'Alvaro Rodrigo Hernandez Laos' },
] as const
