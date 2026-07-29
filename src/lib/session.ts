import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Role } from '@/domain/roles'

const SESSION_COOKIE_NAME = 'vektrium_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 dias

export interface SessionUser {
  id: string
  email: string
  fullName: string
  role: Role
}

export interface Session {
  user: SessionUser
}

/**
 * No hay Supabase todavia, asi que la sesion no la firma un proveedor de
 * identidad sino esta capa: un cookie HMAC-firmado con Node `crypto`, sin
 * dependencias nuevas. SESSION_SECRET debe fijarse por variable de entorno
 * antes de ir a produccion; el valor de respaldo es exclusivamente para que
 * `next dev` funcione hoy sin configuracion.
 */
function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? 'vektrium-dev-insecure-secret-configura-SESSION_SECRET'
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

function encode(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user), 'utf8').toString('base64url')
  return `${payload}.${sign(payload)}`
}

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.fullName === 'string' &&
    typeof candidate.role === 'string'
  )
}

function decode(token: string): SessionUser | null {
  const separatorIndex = token.lastIndexOf('.')
  if (separatorIndex === -1) return null

  const payload = token.slice(0, separatorIndex)
  const signature = token.slice(separatorIndex + 1)
  const expected = sign(payload)

  const provided = Buffer.from(signature)
  const reference = Buffer.from(expected)
  if (provided.length !== reference.length || !timingSafeEqual(provided, reference)) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return isSessionUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Lee la sesion actual desde el cookie firmado. `null` si no hay sesion valida. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const cookie = store.get(SESSION_COOKIE_NAME)
  if (!cookie) return null

  const user = decode(cookie.value)
  return user ? { user } : null
}

/** Exige sesion; redirige a /login si no la hay. Usar en layouts/paginas del portal. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/** Solo puede llamarse desde un Server Action o Route Handler (ver next/headers). */
export async function createSession(user: SessionUser): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, encode(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

/** Solo puede llamarse desde un Server Action o Route Handler (ver next/headers). */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}
