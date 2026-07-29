export const ROLES = [
  'FOUNDER_ADMIN',
  'PROJECT_MANAGER',
  'COLLABORATOR',
  'CLIENT',
  'VIEWER',
] as const

export type Role = (typeof ROLES)[number]
