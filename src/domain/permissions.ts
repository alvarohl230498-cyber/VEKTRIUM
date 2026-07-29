import { type Role, type Scope, mostPermissive } from './roles'

export const ACTIONS = [
  'client.read', 'client.create', 'client.update',
  'contact.read', 'contact.create', 'contact.update',
  'opportunity.read', 'opportunity.create', 'opportunity.update',
  'project.read', 'project.create', 'project.update',
  'project.archive', 'project.trash', 'project.purge',
  'phase.read', 'phase.create', 'phase.update', 'phase.delete',
  'task.read', 'task.create', 'task.update',
  'meeting.read', 'meeting.create', 'meeting.update',
  'audit.read',
  'user.manage',
] as const

export type Action = (typeof ACTIONS)[number]

/** Fila del rol con menos privilegios. Las demas la extienden. */
const NONE: Record<Action, Scope> = Object.fromEntries(
  ACTIONS.map((a) => [a, 'none' as Scope]),
) as Record<Action, Scope>

const VIEWER: Record<Action, Scope> = {
  ...NONE,
  'client.read': 'member',
  'contact.read': 'member',
  'project.read': 'member',
  'phase.read': 'member',
  'task.read': 'member',
  'meeting.read': 'member',
}

const CLIENT: Record<Action, Scope> = {
  ...NONE,
  'client.read': 'own',
  'contact.read': 'own',
  'project.read': 'member',
  'phase.read': 'member',
  'task.read': 'member',
  'meeting.read': 'member',
}

const COLLABORATOR: Record<Action, Scope> = {
  ...VIEWER,
  'task.create': 'assignee',
  'task.update': 'assignee',
}

const PROJECT_MANAGER: Record<Action, Scope> = {
  ...COLLABORATOR,
  'client.read': 'all',
  'client.create': 'all',
  'client.update': 'all',
  'contact.read': 'all',
  'contact.create': 'all',
  'contact.update': 'all',
  'opportunity.read': 'all',
  'opportunity.create': 'all',
  'opportunity.update': 'all',
  'project.create': 'all',
  'project.update': 'member',
  'project.archive': 'member',
  'project.trash': 'member',
  'phase.create': 'member',
  'phase.update': 'member',
  'phase.delete': 'member',
  'task.create': 'member',
  'task.update': 'member',
  'meeting.create': 'all',
  'meeting.update': 'all',
  'audit.read': 'member',
}

const FOUNDER_ADMIN: Record<Action, Scope> = Object.fromEntries(
  ACTIONS.map((a) => [a, 'all' as Scope]),
) as Record<Action, Scope>

const MATRIX: Record<Role, Record<Action, Scope>> = {
  FOUNDER_ADMIN,
  PROJECT_MANAGER,
  COLLABORATOR,
  CLIENT,
  VIEWER,
}

export interface CanInput {
  globalRole: Role
  projectRole?: Role
  action: Action
}

/**
 * Devuelve el alcance con el que el usuario puede ejecutar la accion.
 * El rol de proyecto solo puede elevar, nunca degradar.
 *
 * Excepcion deliberada: si projectRole es 'FOUNDER_ADMIN' se ignora y solo
 * cuenta el rol global. FOUNDER_ADMIN es un rol de alcance global — no
 * existe tal cosa como "founder admin de este proyecto en particular" — y
 * una membresia de proyecto nunca deberia poder asignarlo. El tipo Role no
 * impide pasarlo como projectRole, y si MATRIX se reutilizara sin esta
 * guarda, cualquier accion con fila FOUNDER_ADMIN = 'all' (project.purge,
 * user.manage, audit.read, etc.) se elevaria a 'all' via mostPermissive
 * para un usuario sin privilegios globales. Eso es una fuga de datos, no
 * una elevacion legitima.
 */
export function can({ globalRole, projectRole, action }: CanInput): Scope {
  const global = MATRIX[globalRole][action]
  if (!projectRole || projectRole === 'FOUNDER_ADMIN') return global
  return mostPermissive(global, MATRIX[projectRole][action])
}
