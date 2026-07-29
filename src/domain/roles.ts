export const ROLES = [
  'FOUNDER_ADMIN',
  'PROJECT_MANAGER',
  'COLLABORATOR',
  'CLIENT',
  'VIEWER',
] as const

export type Role = (typeof ROLES)[number]

/** De menos a mas permisivo. El indice define la comparacion. */
export const SCOPES = ['none', 'own', 'assignee', 'member', 'all'] as const

export type Scope = (typeof SCOPES)[number]

export function mostPermissive(a: Scope, b: Scope): Scope {
  return SCOPES.indexOf(a) >= SCOPES.indexOf(b) ? a : b
}
