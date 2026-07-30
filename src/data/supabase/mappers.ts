import type * as schema from '@/db/schema'
import type { TaskStatus } from '@/domain/progress'
import type { Role } from '@/domain/roles'
import type { OpportunityStatus } from '@/domain/state-machines'
import type {
  Client,
  Contact,
  Illustrative,
  Meeting,
  MeetingAttendee,
  MeetingType,
  Opportunity,
  Project,
  ProjectPhase,
  Task,
  User,
} from '../types'

/**
 * Convierte filas de Drizzle (postgres.js) a las formas de src/data/types.ts.
 *
 * Tres conversiones no triviales:
 * - `numeric` (expected_amount, progress_cached) llega como `string` — hay
 *   que pasarla por `Number(...)`.
 * - `timestamp`/`date` llegan como `Date` — hay que serializarlas a ISO
 *   (timestamps) o a `YYYY-MM-DD` (date, sin zona horaria).
 * - Los pgEnum construidos a partir de un `as const` importado de src/domain
 *   (roleEnum, opportunityStatusEnum, taskStatusEnum, meetingTypeEnum, ver
 *   src/db/schema/*.ts) se declaran con `as unknown as [string, ...string[]]`
 *   para satisfacer la firma de pgEnum, lo que ensancha su tipo TS a
 *   `string` en vez del literal union real. La restriccion CHECK de
 *   Postgres (el enum) sigue garantizando el valor en runtime; aqui solo se
 *   restaura el tipo con un cast explicito y documentado.
 */

export function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

export function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

export function toIsoOrNull(value: Date | string | null): string | null {
  return value === null ? null : toIso(value)
}

/** Columnas `date` de Postgres no llevan zona horaria: se serializan a YYYY-MM-DD. */
export function toDateOnly(value: Date | string): string {
  if (typeof value === 'string') return value
  return value.toISOString().slice(0, 10)
}

export function toDateOnlyOrNull(value: Date | string | null): string | null {
  return value === null ? null : toDateOnly(value)
}

/**
 * `Illustrative.isIllustrative` es `true | undefined` con
 * `exactOptionalPropertyTypes`, lo que exige OMITIR la clave en vez de
 * fijarla en `undefined`. Este helper produce `{}` o `{ isIllustrative: true }`
 * para spreadearlo.
 */
function illustrativeFlag(value: boolean): Illustrative {
  return value ? { isIllustrative: true } : {}
}

type UserRow = typeof schema.users.$inferSelect
type ClientRow = typeof schema.clients.$inferSelect
type ContactRow = typeof schema.contacts.$inferSelect
type OpportunityRow = typeof schema.opportunities.$inferSelect
type ProjectRow = typeof schema.projects.$inferSelect
type ProjectPhaseRow = typeof schema.projectPhases.$inferSelect
type TaskRow = typeof schema.tasks.$inferSelect
type MeetingRow = typeof schema.meetings.$inferSelect
type MeetingAttendeeRow = typeof schema.meetingAttendees.$inferSelect

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    // full_name es nullable en la tabla (por si un usuario se aprovisiona
    // antes de tener nombre); User.fullName no lo es, asi que se degrada a ''.
    fullName: row.fullName ?? '',
    role: row.role as Role,
  }
}

export function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    legalName: row.legalName,
    tradeName: row.tradeName,
    ruc: row.ruc,
    industry: row.industry,
    size: row.size,
    city: row.city,
    country: row.country,
    confidentiality: row.confidentiality,
    createdAt: toIso(row.createdAt),
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    clientId: row.clientId,
    fullName: row.fullName,
    position: row.position,
    email: row.email,
    phone: row.phone,
    isPrimary: row.isPrimary,
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    clientId: row.clientId,
    title: row.title,
    status: row.status as OpportunityStatus,
    lossReason: row.lossReason,
    expectedAmount: toNumber(row.expectedAmount),
    ownerId: row.ownerId,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    code: row.code,
    clientId: row.clientId,
    opportunityId: row.opportunityId,
    name: row.name,
    status: row.status,
    health: row.health,
    healthReason: row.healthReason,
    ownerId: row.ownerId,
    startDate: toDateOnly(row.startDate),
    targetDate: toDateOnly(row.targetDate),
    archivedAt: toIsoOrNull(row.archivedAt),
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapProjectPhase(row: ProjectPhaseRow): ProjectPhase {
  return {
    id: row.id,
    projectId: row.projectId,
    order: row.order,
    name: row.name,
    description: row.description,
    weight: row.weight,
    plannedStart: toDateOnlyOrNull(row.plannedStart),
    plannedEnd: toDateOnlyOrNull(row.plannedEnd),
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.projectId,
    phaseId: row.phaseId,
    title: row.title,
    status: row.status as TaskStatus,
    weight: row.weight,
    assigneeId: row.assigneeId,
    dueDate: toDateOnlyOrNull(row.dueDate),
    completedAt: toIsoOrNull(row.completedAt),
    ...illustrativeFlag(row.isIllustrative),
  }
}

export function mapMeetingAttendee(row: MeetingAttendeeRow): MeetingAttendee {
  return {
    userId: row.userId,
    contactId: row.contactId,
    email: row.email,
    fullName: row.fullName,
    response: row.response,
  }
}

export function mapMeeting(row: MeetingRow, attendees: MeetingAttendeeRow[]): Meeting {
  return {
    id: row.id,
    clientId: row.clientId,
    projectId: row.projectId,
    type: row.type as MeetingType,
    title: row.title,
    agenda: row.agenda,
    startsAt: toIso(row.startsAt),
    endsAt: toIso(row.endsAt),
    organizerId: row.organizerId,
    isMock: row.isMock,
    meetUrl: row.meetUrl,
    providerEventId: row.providerEventId,
    requestId: row.requestId,
    syncStatus: row.syncStatus,
    syncError: row.syncError,
    attendees: attendees.map(mapMeetingAttendee),
    hasMinutes: row.hasMinutes,
    ...illustrativeFlag(row.isIllustrative),
  }
}
