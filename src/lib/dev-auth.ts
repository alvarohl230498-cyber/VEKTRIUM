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

/**
 * IDs reales de la tabla `users` en Supabase (UUID, no los ids ficticios
 * 'user-juan-diego'/'user-alvaro' del repositorio en memoria). Necesarios
 * porque, con DATABASE_URL_APP definida, getRepository() siempre usa el
 * repositorio real: un id que no exista en la base autentica "con exito"
 * pero no encuentra usuario, y el login de desarrollo falla en silencio.
 *
 * El id de Alvaro es el mismo que su fila real (provisionada por el enlace
 * magico); el de Juan Diego se sembro aparte solo para poder probar el
 * portal en desarrollo antes de tener su correo real.
 */
export const DEV_SIGN_IN_USERS = [
  { id: '9de0f19e-00cb-4b88-baa9-cd4ea7a41f6c', label: 'Juan Diego Salazar Campos' },
  { id: 'e1b40199-68ca-4ce9-96cf-cc0f31309147', label: 'Alvaro Rodrigo Hernandez Laos' },
] as const
