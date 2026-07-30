import 'server-only'
import { and, asc, eq, inArray, isNull } from 'drizzle-orm'
import type { DbTransaction } from '@/db/client'
import { withUserContext } from '@/db/client'
import * as schema from '@/db/schema'
import { buildPhasesForProject } from '@/domain/phases'
import type { TaskStatus } from '@/domain/progress'
import { err, ok } from '@/domain/result'
import type { OpportunityStatus } from '@/domain/state-machines'
import { transitionOpportunity, transitionTask } from '@/domain/state-machines'
import type {
  ConvertOpportunityInput,
  MeetingSyncPatch,
  NewClientInput,
  NewMeetingInput,
  NewOpportunityInput,
  VektriumRepository,
} from '../repository'
import type { ProjectPhaseWithTasks, ProjectWithPhases } from '../types'
import {
  mapClient,
  mapContact,
  mapMeeting,
  mapOpportunity,
  mapProject,
  mapProjectPhase,
  mapTask,
  mapUser,
} from './mappers'

/** Siguiente codigo secuencial VK-0001, VK-0002... Misma logica que la version en memoria. */
function nextProjectCode(codes: string[]): string {
  const max = codes.reduce((acc, code) => {
    const match = /^VK-(\d+)$/.exec(code)
    if (!match || !match[1]) return acc
    return Math.max(acc, Number(match[1]))
  }, 0)
  return `VK-${String(max + 1).padStart(4, '0')}`
}

async function loadProjectWithPhases(
  db: DbTransaction,
  projectId: string,
): Promise<ProjectWithPhases | null> {
  const [projectRow] = await db
    .select()
    .from(schema.projects)
    .where(and(eq(schema.projects.id, projectId), isNull(schema.projects.deletedAt)))
  if (!projectRow) return null

  const phaseRows = await db
    .select()
    .from(schema.projectPhases)
    .where(eq(schema.projectPhases.projectId, projectId))
    .orderBy(asc(schema.projectPhases.order))

  const taskRows = phaseRows.length
    ? await db.select().from(schema.tasks).where(eq(schema.tasks.projectId, projectId))
    : []

  const phases: ProjectPhaseWithTasks[] = phaseRows.map((phase) => ({
    ...mapProjectPhase(phase),
    tasks: taskRows.filter((t) => t.phaseId === phase.id).map(mapTask),
  }))

  return { ...mapProject(projectRow), phases }
}

/**
 * Implementacion de VektriumRepository respaldada por Supabase (Postgres +
 * RLS) via Drizzle. `actingUserId` se captura una sola vez al construir el
 * repositorio (ver src/data/index.ts) y cada metodo — lectura o escritura —
 * lo usa para abrir una transaccion con withUserContext(). Es la unica forma
 * de que auth.uid() resuelva dentro de las politicas RLS: sin esto, toda
 * lectura devolveria cero filas (verificado contra el proyecto real: el rol
 * vektrium_app es miembro de `authenticated`, pero sin
 * request.jwt.claim.sub fijado, auth.uid() es null y ninguna politica
 * coincide).
 *
 * Se prefirio este diseno "de fabrica" (una funcion que cierra sobre
 * actingUserId) a anadir un parametro actingUserId a cada metodo de
 * escritura del contrato: dejaba el contrato VektriumRepository
 * absolutamente sin cambios (ni siquiera los metodos de escritura lo tocan)
 * y resuelve lecturas y escrituras con el mismo mecanismo. Ver el reporte
 * para el detalle de esta decision.
 */
export function createSupabaseRepository(actingUserId: string): VektriumRepository {
  return {
    async listUsers() {
      return withUserContext(actingUserId, async (tx) => {
        const rows = await tx.select().from(schema.users)
        return rows.map(mapUser)
      })
    },

    async getUserById(id) {
      return withUserContext(actingUserId, async (tx) => {
        const [row] = await tx.select().from(schema.users).where(eq(schema.users.id, id))
        return row ? mapUser(row) : null
      })
    },

    async listClients() {
      return withUserContext(actingUserId, async (tx) => {
        const rows = await tx
          .select()
          .from(schema.clients)
          .where(isNull(schema.clients.deletedAt))
        return rows.map(mapClient)
      })
    },

    async getClientById(id) {
      return withUserContext(actingUserId, async (tx) => {
        const [row] = await tx
          .select()
          .from(schema.clients)
          .where(and(eq(schema.clients.id, id), isNull(schema.clients.deletedAt)))
        return row ? mapClient(row) : null
      })
    },

    async listContactsByClient(clientId) {
      return withUserContext(actingUserId, async (tx) => {
        const rows = await tx
          .select()
          .from(schema.contacts)
          .where(eq(schema.contacts.clientId, clientId))
        return rows.map(mapContact)
      })
    },

    async createClient(input: NewClientInput) {
      return withUserContext(actingUserId, async (tx) => {
        const [row] = await tx
          .insert(schema.clients)
          .values({
            legalName: input.legalName,
            tradeName: input.tradeName,
            ruc: input.ruc,
            industry: input.industry,
            size: input.size,
            city: input.city,
            country: input.country,
            confidentiality: input.confidentiality,
          })
          .returning()
        if (!row) throw new Error('No se pudo crear el cliente.')
        return mapClient(row)
      })
    },

    async listOpportunities() {
      return withUserContext(actingUserId, async (tx) => {
        const rows = await tx.select().from(schema.opportunities)
        return rows.map(mapOpportunity)
      })
    },

    async getOpportunityById(id) {
      return withUserContext(actingUserId, async (tx) => {
        const [row] = await tx
          .select()
          .from(schema.opportunities)
          .where(eq(schema.opportunities.id, id))
        return row ? mapOpportunity(row) : null
      })
    },

    async createOpportunity(input: NewOpportunityInput) {
      return withUserContext(actingUserId, async (tx) => {
        const [row] = await tx
          .insert(schema.opportunities)
          .values({
            clientId: input.clientId,
            title: input.title,
            status: 'nuevo_lead',
            expectedAmount: String(input.expectedAmount),
            ownerId: input.ownerId,
          })
          .returning()
        if (!row) throw new Error('No se pudo crear la oportunidad.')
        return mapOpportunity(row)
      })
    },

    async updateOpportunityStatus(id, to, ctx) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const [current] = await db.select().from(schema.opportunities).where(eq(schema.opportunities.id, id))
        if (!current) return null

        const result = transitionOpportunity(current.status as OpportunityStatus, to, ctx)
        if (!result.ok) return err(result.error)

        const [updated] = await db
          .update(schema.opportunities)
          .set({
            status: result.value,
            updatedAt: new Date(),
            ...(result.value === 'no_aceptado' && ctx.lossReason ? { lossReason: ctx.lossReason } : {}),
          })
          .where(eq(schema.opportunities.id, id))
          .returning()
        if (!updated) throw new Error('No se pudo actualizar la oportunidad.')
        return ok(mapOpportunity(updated))
      })
    },

    async convertOpportunityToProject(opportunityId, input: ConvertOpportunityInput) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const [opportunity] = await db
          .select()
          .from(schema.opportunities)
          .where(eq(schema.opportunities.id, opportunityId))
        if (!opportunity) return null

        if (opportunity.status !== 'ganado') {
          const result = transitionOpportunity(opportunity.status as OpportunityStatus, 'ganado', {})
          if (!result.ok) return err(result.error)
        }

        // Esquema secuencial VK-0001, VK-0002... Hay una ventana teorica de
        // condicion de carrera entre este SELECT y el INSERT (sin advisory
        // lock): dos conversiones concurrentes podrian calcular el mismo
        // codigo. Aceptable dado el volumen real (conversion manual, un
        // fundador a la vez); el UNIQUE de projects.code convertiria la
        // colision en un error explicito, nunca en un duplicado silencioso.
        const existingCodes = await db.select({ code: schema.projects.code }).from(schema.projects)
        const code = nextProjectCode(existingCodes.map((c) => c.code))

        // Anotacion explicita del tipo del literal (en vez de dejar que
        // TypeScript lo infiera dentro de la llamada encadenada): dentro de
        // este objeto literal grande contextualmente tipado contra
        // VektriumRepository, sin ella TS resolvia mal la sobrecarga de
        // `.values()` (elegia la variante de array e informaba, de forma
        // enganosa, que falta 'code' — que si existe en el tipo real).
        const projectValues: typeof schema.projects.$inferInsert = {
          code,
          clientId: opportunity.clientId,
          opportunityId: opportunity.id,
          name: input.name,
          status: 'activo',
          health: 'sano',
          ownerId: input.ownerId,
          startDate: new Date(input.startDate).toISOString().slice(0, 10),
          targetDate: new Date(input.targetDate).toISOString().slice(0, 10),
        }
        const [projectRow] = await db.insert(schema.projects).values(projectValues).returning()
        if (!projectRow) throw new Error('No se pudo crear el proyecto.')

        const templates = buildPhasesForProject(projectRow.id)
        const phaseRows = await db
          .insert(schema.projectPhases)
          .values(
            templates.map((t) => ({
              projectId: t.projectId,
              order: t.order,
              name: t.name,
              description: t.description,
              weight: t.weight,
            })),
          )
          .returning()

        await db
          .update(schema.opportunities)
          .set({ status: 'ganado', updatedAt: new Date() })
          .where(eq(schema.opportunities.id, opportunityId))

        const orderedPhases = [...phaseRows].sort((a, b) => a.order - b.order)
        const phases: ProjectPhaseWithTasks[] = orderedPhases.map((p) => ({ ...mapProjectPhase(p), tasks: [] }))

        return ok({ ...mapProject(projectRow), phases })
      })
    },

    async listProjects() {
      return withUserContext(actingUserId, async (tx) => {
        const rows = await tx
          .select()
          .from(schema.projects)
          .where(isNull(schema.projects.deletedAt))
        return rows.map(mapProject)
      })
    },

    async getProjectWithPhases(id) {
      return withUserContext(actingUserId, (tx) => loadProjectWithPhases(tx, id))
    },

    async listProjectsWithPhases() {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const projectRows = await db.select().from(schema.projects).where(isNull(schema.projects.deletedAt))
        if (projectRows.length === 0) return []

        const projectIds = projectRows.map((p) => p.id)
        const phaseRows = await db
          .select()
          .from(schema.projectPhases)
          .where(inArray(schema.projectPhases.projectId, projectIds))
          .orderBy(asc(schema.projectPhases.order))
        const taskRows = await db.select().from(schema.tasks).where(inArray(schema.tasks.projectId, projectIds))

        return projectRows.map((project) => {
          const phases: ProjectPhaseWithTasks[] = phaseRows
            .filter((ph) => ph.projectId === project.id)
            .map((ph) => ({
              ...mapProjectPhase(ph),
              tasks: taskRows.filter((t) => t.phaseId === ph.id).map(mapTask),
            }))
          return { ...mapProject(project), phases }
        })
      })
    },

    async listMeetings() {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const meetingRows = await db.select().from(schema.meetings)
        if (meetingRows.length === 0) return []

        const meetingIds = meetingRows.map((m) => m.id)
        const attendeeRows = await db
          .select()
          .from(schema.meetingAttendees)
          .where(inArray(schema.meetingAttendees.meetingId, meetingIds))

        return meetingRows.map((m) =>
          mapMeeting(
            m,
            attendeeRows.filter((a) => a.meetingId === m.id),
          ),
        )
      })
    },

    async createMeeting(input: NewMeetingInput) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const [meetingRow] = await db
          .insert(schema.meetings)
          .values({
            clientId: input.clientId,
            projectId: input.projectId,
            type: input.type,
            title: input.title,
            agenda: input.agenda,
            startsAt: new Date(input.startsAt),
            endsAt: new Date(input.endsAt),
            organizerId: input.organizerId,
            isMock: input.isMock,
            meetUrl: input.meetUrl,
            providerEventId: input.providerEventId,
            requestId: input.requestId,
            syncStatus: input.syncStatus,
            syncError: input.syncError,
            hasMinutes: input.hasMinutes,
          })
          .returning()
        if (!meetingRow) throw new Error('No se pudo crear la reunion.')

        const attendeeRows = input.attendees.length
          ? await db
              .insert(schema.meetingAttendees)
              .values(
                input.attendees.map((a) => ({
                  meetingId: meetingRow.id,
                  userId: a.userId,
                  contactId: a.contactId,
                  email: a.email,
                  fullName: a.fullName,
                  response: a.response,
                })),
              )
              .returning()
          : []

        return mapMeeting(meetingRow, attendeeRows)
      })
    },

    async updateMeetingStatus(id: string, patch: MeetingSyncPatch) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const set: Partial<typeof schema.meetings.$inferInsert> = { syncStatus: patch.syncStatus }
        if (patch.syncError !== undefined) set.syncError = patch.syncError
        if (patch.meetUrl !== undefined) set.meetUrl = patch.meetUrl
        if (patch.providerEventId !== undefined) set.providerEventId = patch.providerEventId
        if (patch.isMock !== undefined) set.isMock = patch.isMock

        const [updated] = await db.update(schema.meetings).set(set).where(eq(schema.meetings.id, id)).returning()
        if (!updated) return null

        const attendeeRows = await db
          .select()
          .from(schema.meetingAttendees)
          .where(eq(schema.meetingAttendees.meetingId, id))
        return mapMeeting(updated, attendeeRows)
      })
    },

    async moveTask(taskId, status) {
      return withUserContext(actingUserId, async (tx) => {
        const db = tx
        const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId))
        if (!task) return null

        const result = transitionTask(task.status as TaskStatus, status, { completionCriteriaMet: true })
        if (!result.ok) return null

        const [updated] = await db
          .update(schema.tasks)
          .set({
            status: result.value,
            completedAt: result.value === 'completada' ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(schema.tasks.id, taskId))
          .returning()
        if (!updated) return null
        return mapTask(updated)
      })
    },
  }
}
